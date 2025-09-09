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

        public BookController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // ======================================================
        // 📌 Public Endpoints (Anyone can access approved books)
        // ======================================================

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var books = await _bookService.GetAllAsync();
            return Ok(books);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null || !book.IsApproved) return NotFound();
            return Ok(book);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var books = await _bookService.SearchAsync(query);
            return Ok(books);
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
            return Ok(books);
        }

        // ======================================================
        // 📌 Author Endpoints (Submit requests)
        // ======================================================

        [HttpPost("submit")]
        [Authorize(Roles = "Author")]
        public async Task<IActionResult> SubmitRequest([FromBody] BookRequest request)
        {
            // ✅ Ensure the logged-in user's ID is used
            var userIdClaim = User.FindFirst("id") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            request.RequestedById = int.Parse(userIdClaim.Value);

            // ✅ Force status to "Pending" (ignore frontend status)
            request.Status = "Pending";

            var savedRequest = await _bookService.SubmitRequestAsync(request);
            return Ok(new { message = "Book request submitted for admin approval", request = savedRequest });
        }

        // ======================================================
        // 📌 Admin Endpoints (Manage books + requests)
        // ======================================================

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
            if (updatedBook == null) return NotFound();
            return Ok(updatedBook);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Book deleted" });
        }

        [HttpGet("requests")]
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
            if (book == null) return NotFound();
            return Ok(new { message = "Book request approved and added to library", book });
        }

        [HttpPut("requests/{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            var result = await _bookService.RejectRequestAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Book request rejected" });
        }
        // 🔹 Get all requests submitted by the logged-in Author
        [HttpGet("my-requests")]
        [Authorize(Roles = "Author")]
        public async Task<IActionResult> GetMyRequests()
        {
            // Get current logged-in user Id
            var userId = int.Parse(User.FindFirst("id").Value);

            var requests = await _bookService.GetRequestsByUserIdAsync(userId);
            return Ok(requests);
        }


    }
}
