using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;
using BookApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IWebHostEnvironment _env;

        public BookController(IBookService bookService, IWebHostEnvironment env)
        {
            _bookService = bookService;
            _env = env;
        }

        // ---------------------------
        // Helper: safely get user id
        // ---------------------------
        private bool TryGetUserId(out int userId)
        {
            userId = 0;
            var claim = User?.FindFirst(ClaimTypes.NameIdentifier) ??
                        User?.FindFirst("sub") ??
                        User?.FindFirst("id") ??
                        User?.FindFirst("nameid");

            return claim != null && int.TryParse(claim.Value, out userId);
        }

        // ======================================================
        // 📌 Public Endpoints (Approved Books Only)
        // ======================================================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetApproved()
        {
            var books = await _bookService.GetAllAsync();
            return Ok(books.Where(b => b.IsApproved));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null || !book.IsApproved)
                return NotFound(new { message = "Book not found or not approved" });

            return Ok(book);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var books = await _bookService.SearchAsync(query);
            return Ok(books.Where(b => b.IsApproved));
        }

        [HttpGet("filter")]
        [AllowAnonymous]
        public async Task<IActionResult> Filter(
            [FromQuery] string? author,
            [FromQuery] string? category,
            [FromQuery] string? genre,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice)
        {
            var books = await _bookService.FilterAsync(author, category, genre, minPrice, maxPrice);
            return Ok(books.Where(b => b.IsApproved));
        }

        // ======================================================
        // 📌 Author Endpoints
        // ======================================================
        [HttpPost("submit-json")]
        [Authorize(Roles = "Author")]
        public async Task<IActionResult> SubmitRequestJson([FromBody] BookRequestDto dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "User ID not found in token" });

            dto.RequestedById = userId;
            dto.Status = "Pending";

            var savedRequest = await _bookService.SubmitRequestAsync(dto);
            return Ok(new { message = "Book request submitted for admin approval", request = savedRequest });
        }

        [HttpPost("submit")]
        [Authorize(Roles = "Author")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubmitRequestForm([FromForm] CreateBookRequestDto dto)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "User ID not found in token" });

            string webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            string? coverImageUrl = null;
            string? samplePdfUrl = null;

            try
            {
                // Save cover image
                if (dto.CoverImage != null)
                {
                    var coverDir = Path.Combine(webRoot, "uploads", "covers");
                    Directory.CreateDirectory(coverDir);
                    var coverFile = Path.Combine(coverDir, Guid.NewGuid() + Path.GetExtension(dto.CoverImage.FileName));
                    await using var coverStream = new FileStream(coverFile, FileMode.Create);
                    await dto.CoverImage.CopyToAsync(coverStream);
                    coverImageUrl = "/uploads/covers/" + Path.GetFileName(coverFile);
                }

                // Save sample PDF
                if (dto.SamplePdf != null)
                {
                    var pdfDir = Path.Combine(webRoot, "uploads", "pdfs");
                    Directory.CreateDirectory(pdfDir);
                    var pdfFile = Path.Combine(pdfDir, Guid.NewGuid() + Path.GetExtension(dto.SamplePdf.FileName));
                    await using var pdfStream = new FileStream(pdfFile, FileMode.Create);
                    await dto.SamplePdf.CopyToAsync(pdfStream);
                    samplePdfUrl = "/uploads/pdfs/" + Path.GetFileName(pdfFile);
                }

                var requestDto = new BookRequestDto
                {
                    Title = dto.Title,
                    AuthorName = dto.AuthorName,
                    Description = dto.Description,
                    Genre = dto.Genre,
                    Price = dto.Price,
                    CoverImageUrl = coverImageUrl,
                    SamplePdfUrl = samplePdfUrl,
                    RequestedById = userId,
                    Status = "Pending"
                };

                var savedRequest = await _bookService.SubmitRequestAsync(requestDto);
                return Ok(new { message = "Book request submitted for admin approval", request = savedRequest });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to submit request", details = ex.Message });
            }
        }

        [HttpGet("my-requests")]
        [Authorize(Roles = "Author")]
        public async Task<IActionResult> GetMyRequests()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(new { message = "User ID not found in token" });

            var requests = await _bookService.GetRequestsByUserIdAsync(userId);
            return Ok(requests);
        }

        // ======================================================
        // 📌 Admin Endpoints
        // ======================================================
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var books = await _bookService.GetAllAsync();
            return Ok(books); // Admin sees all (approved + unapproved)
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] BookDto dto)
        {
            var book = await _bookService.CreateAsync(dto, isApproved: true);
            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] BookDto dto)
        {
            var updatedBook = await _bookService.UpdateAsync(id, dto);
            if (updatedBook == null) return NotFound(new { message = "Book not found" });
            return Ok(updatedBook);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookService.DeleteAsync(id);
            if (!result) return NotFound(new { message = "Book not found" });
            return Ok(new { message = "Book deleted successfully" });
        }

        [HttpGet("requests/pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var requests = await _bookService.GetPendingRequestsAsync();
            return Ok(requests);
        }

        [HttpPut("requests/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var book = await _bookService.ApproveRequestAsync(id);
            if (book == null) return NotFound(new { message = "Request not found or already processed" });

            return Ok(new { message = "Book request approved and added to library", book });
        }

        [HttpPut("requests/{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            var result = await _bookService.RejectRequestAsync(id);
            if (!result) return NotFound(new { message = "Request not found or already processed" });

            return Ok(new { message = "Book request rejected" });
        }

        // ======================================================
        // 📌 PATCH: Toggle Book Approval Status
        // ======================================================
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null) return NotFound(new { message = "Book not found" });

            book.IsApproved = dto.IsApproved;

            var updatedBook = await _bookService.UpdateAsync(id, new BookDto
            {
                Title = book.Title,
                Description = book.Description,
                Genre = book.Genre,
                Price = book.Price,
                ImageUrl = book.ImageUrl,
                SamplePdfUrl = book.SamplePdfUrl,
                AuthorId = book.AuthorId,
                CategoryId = book.CategoryId,
                IsApproved = book.IsApproved
            });

            return Ok(updatedBook);
        }
    }
}

// ======================================
// StatusUpdateDto.cs
// ======================================
namespace BookApp.Api.Models.DTOs
{
    public class StatusUpdateDto
    {
        public bool IsApproved { get; set; }
    }
}
