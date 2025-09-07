using BookApp.Api.Data;
using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BookApp.Api.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;

        public BookService(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Get all approved books
        public async Task<IEnumerable<BookDto>> GetAllAsync()
        {
            var books = await _context.Books
                .Where(b => b.IsApproved)
                .Include(b => b.Author)
                .Include(b => b.Category)
                .ToListAsync();

            return books.Select(MapToDto);
        }

        // 🔹 Get book by ID
        public async Task<BookDto?> GetByIdAsync(int id)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);

            return book == null ? null : MapToDto(book);
        }

        // 🔹 Create book (Admin = auto-approved, Author/User = requires approval)
        public async Task<BookDto> CreateAsync(BookDto dto, bool isApproved = true)
        {
            var book = new Book
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Genre = dto.Genre,
                AuthorId = dto.AuthorId,
                CategoryId = dto.CategoryId,
                ImageUrl = dto.ImageUrl,
                IsApproved = isApproved
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return MapToDto(book);
        }

        // 🔹 Update book
        public async Task<BookDto?> UpdateAsync(int id, BookDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return null;

            book.Title = dto.Title;
            book.Description = dto.Description;
            book.Genre = dto.Genre;
            book.Price = dto.Price;
            book.ImageUrl = dto.ImageUrl;
            book.AuthorId = dto.AuthorId;
            book.CategoryId = dto.CategoryId;

            await _context.SaveChangesAsync();
            return MapToDto(book);
        }

        // 🔹 Delete book
        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        // 🔹 Search books (approved only)
        public async Task<IEnumerable<BookDto>> SearchAsync(string query)
        {
            var books = await _context.Books
                .Where(b => b.IsApproved && b.Title.Contains(query))
                .Include(b => b.Author)
                .Include(b => b.Category)
                .ToListAsync();

            return books.Select(MapToDto);
        }

        // 🔹 Filter books (approved only)
        public async Task<IEnumerable<BookDto>> FilterAsync(string? author, string? category, string? genre, decimal? minPrice, decimal? maxPrice)
        {
            var query = _context.Books
                .Where(b => b.IsApproved)
                .Include(b => b.Author)
                .Include(b => b.Category)
                .AsQueryable();

            if (!string.IsNullOrEmpty(author))
                query = query.Where(b => b.Author.Name.Contains(author));

            if (!string.IsNullOrEmpty(category))
                query = query.Where(b => b.Category.Name.Contains(category));

            if (!string.IsNullOrEmpty(genre))
                query = query.Where(b => b.Genre.Contains(genre));

            if (minPrice.HasValue)
                query = query.Where(b => b.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(b => b.Price <= maxPrice.Value);

            var books = await query.ToListAsync();
            return books.Select(MapToDto);
        }

        // 🔹 Approve book (Admin only)
        public async Task<Book?> ApproveAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return null;

            book.IsApproved = true;
            await _context.SaveChangesAsync();
            return book;
        }

        // 🔹 Helper: map entity → DTO
        private static BookDto MapToDto(Book book) =>
            new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                Description = book.Description,
                AuthorId = book.AuthorId,
                AuthorName = book.Author?.Name,
                CategoryId = book.CategoryId,
                CategoryName = book.Category?.Name,
                Genre = book.Genre,
                Price = book.Price,
                ImageUrl = book.ImageUrl,
                IsApproved = book.IsApproved
            };
    }
}
