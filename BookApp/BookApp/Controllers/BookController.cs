using BookApp.Api.Models.DTOs;
using BookApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        // 🔹 Get all approved books (public)
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var books = await _bookService.GetAllAsync();
            return Ok(books);
        }

        // 🔹 Get book by ID (only if approved)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null || !book.IsApproved) return NotFound();
            return Ok(book);
        }

        // 🔹 Add new book directly (Admin only, auto-approved)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] BookDto dto)
        {
            var book = await _bookService.CreateAsync(dto, isApproved: true);
            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        // 🔹 Update book (Admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] BookDto dto)
        {
            var updatedBook = await _bookService.UpdateAsync(id, dto);
            if (updatedBook == null) return NotFound();
            return Ok(updatedBook);
        }

        // 🔹 Delete book (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _bookService.DeleteAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Book deleted" });
        }

        // 🔹 Search books by title (only approved books)
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            var books = await _bookService.SearchAsync(query);
            return Ok(books);
        }

        // 🔹 Filter books by author/category/genre/price (only approved books)
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

        // 🔹 Submit book (Author only → requires approval)
        [HttpPost("submit")]
        [Authorize(Roles = "Author")]
        public async Task<IActionResult> SubmitBook([FromBody] BookDto dto)
        {
            var book = await _bookService.CreateAsync(dto, isApproved: false);
            return Ok(new { message = "Book submitted for review", book });
        }

        // 🔹 Approve book (Admin only)
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveBook(int id)
        {
            var book = await _bookService.ApproveAsync(id);
            if (book == null) return NotFound();
            return Ok(new { message = "Book approved", book });
        }
    }
}
