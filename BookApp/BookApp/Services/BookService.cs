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

        // ===============================
        // 📌 Helper: Normalize file paths
        // ===============================
        private static string NormalizeFilePath(string? path)
        {
            if (string.IsNullOrEmpty(path)) return string.Empty;
            return path.StartsWith("/api/uploads", StringComparison.OrdinalIgnoreCase)
                ? path.Replace("/api", "")
                : path;
        }

        // ===============================
        // 📌 Books CRUD
        // ===============================
        public async Task<IEnumerable<BookDto>> GetAllAsync()
        {
            var books = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .ToListAsync(); // Admin sees all (approved + unapproved)

            return books.Select(MapToDto);
        }

        public async Task<BookDto?> GetByIdAsync(int id)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);

            return book == null ? null : MapToDto(book);
        }

        public async Task<BookDto> CreateAsync(BookDto dto, bool isApproved = true)
        {
            var book = new Book
            {
                Title = dto.Title,
                Description = dto.Description,
                Genre = dto.Genre,
                Price = dto.Price,
                AuthorId = dto.AuthorId,
                CategoryId = dto.CategoryId,
                ImageUrl = NormalizeFilePath(dto.ImageUrl),
                SamplePdfUrl = NormalizeFilePath(dto.SamplePdfUrl),
                IsApproved = isApproved
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return MapToDto(book);
        }

        public async Task<BookDto?> UpdateAsync(int id, BookDto dto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return null;

            book.Title = dto.Title;
            book.Description = dto.Description;
            book.Genre = dto.Genre;
            book.Price = dto.Price;
            book.ImageUrl = NormalizeFilePath(dto.ImageUrl);
            book.SamplePdfUrl = NormalizeFilePath(dto.SamplePdfUrl);
            book.AuthorId = dto.AuthorId;
            book.CategoryId = dto.CategoryId;
            book.IsApproved = dto.IsApproved;

            await _context.SaveChangesAsync();
            return MapToDto(book);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        // ===============================
        // 📌 Update Approval Status (Admin)
        // ===============================
        public async Task<Book?> UpdateApprovalStatusAsync(int id, bool isApproved)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return null;

            book.IsApproved = isApproved;
            await _context.SaveChangesAsync();

            return book;
        }

        public async Task<BookDto?> UpdateStatusAsync(int id, bool isApproved)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null) return null;

            book.IsApproved = isApproved;
            await _context.SaveChangesAsync();

            return MapToDto(book);
        }

        public async Task<Book?> ApproveAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return null;

            book.IsApproved = true;
            await _context.SaveChangesAsync();
            return book;
        }

        // ===============================
        // 📌 Search & Filter
        // ===============================
        public async Task<IEnumerable<BookDto>> SearchAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return await GetAllAsync();

            var term = query.Trim().ToLowerInvariant();

            var results = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Category)
                .Where(b => b.IsApproved &&
                    ((b.Title != null && EF.Functions.Like(b.Title.ToLower(), $"%{term}%")) ||
                     (b.Author != null && b.Author.Name != null && EF.Functions.Like(b.Author.Name.ToLower(), $"%{term}%")) ||
                     (b.Category != null && b.Category.Name != null && EF.Functions.Like(b.Category.Name.ToLower(), $"%{term}%")) ||
                     (b.Genre != null && EF.Functions.Like(b.Genre.ToLower(), $"%{term}%"))))
                .ToListAsync();

            return results.Select(MapToDto);
        }

        public async Task<IEnumerable<BookDto>> FilterAsync(string? author, string? category, string? genre, decimal? minPrice, decimal? maxPrice)
        {
            var query = _context.Books
                .Where(b => b.IsApproved)
                .Include(b => b.Author)
                .Include(b => b.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(author))
            {
                var norm = author.Trim().ToLower();
                query = query.Where(b => b.Author != null && b.Author.Name.ToLower().Contains(norm));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                var norm = category.Trim().ToLower();
                query = query.Where(b => b.Category != null && b.Category.Name.ToLower().Contains(norm));
            }

            if (!string.IsNullOrWhiteSpace(genre))
            {
                var norm = genre.Trim().ToLower();
                query = query.Where(b => b.Genre != null && b.Genre.ToLower().Contains(norm));
            }

            if (minPrice.HasValue)
                query = query.Where(b => b.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(b => b.Price <= maxPrice.Value);

            var books = await query.ToListAsync();
            return books.Select(MapToDto);
        }

        // ===============================
        // 📌 Book Requests
        // ===============================
        public async Task<BookRequestDto> SubmitRequestAsync(BookRequestDto requestDto)
        {
            var request = new BookRequest
            {
                Title = requestDto.Title,
                AuthorName = requestDto.AuthorName,
                Description = requestDto.Description,
                CoverImageUrl = NormalizeFilePath(requestDto.CoverImageUrl),
                Genre = requestDto.Genre,
                Price = requestDto.Price,
                SamplePdfUrl = NormalizeFilePath(requestDto.SamplePdfUrl),
                RequestedById = requestDto.RequestedById,
                Status = "Pending"
            };

            _context.BookRequests.Add(request);
            await _context.SaveChangesAsync();

            await _context.Entry(request).Reference(r => r.RequestedBy).LoadAsync();
            return MapToDto(request);
        }

        public async Task<IEnumerable<BookRequestDto>> GetPendingRequestsAsync()
        {
            var requests = await _context.BookRequests
                .Include(r => r.RequestedBy)
                .Where(r => r.Status == "Pending")
                .ToListAsync();

            return requests.Select(MapToDto);
        }

        public async Task<Book?> ApproveRequestAsync(int requestId)
        {
            var req = await _context.BookRequests
                .Include(r => r.RequestedBy)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (req == null || req.Status != "Pending") return null;

            // Ensure Author exists
            var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == req.AuthorName);
            if (author == null)
            {
                author = new Author
                {
                    Name = req.AuthorName ?? "Unknown Author",
                    UserId = req.RequestedById
                };
                _context.Authors.Add(author);
                await _context.SaveChangesAsync();
            }

            // Ensure Category exists
            var defaultCategoryId = await _context.Categories.Select(c => c.Id).FirstOrDefaultAsync();
            if (defaultCategoryId == 0)
                throw new InvalidOperationException("No categories found. Please create a category first.");

            var book = new Book
            {
                Title = req.Title ?? "Untitled",
                Description = req.Description ?? "",
                Genre = req.Genre ?? "",
                Price = req.Price,
                ImageUrl = NormalizeFilePath(req.CoverImageUrl),
                SamplePdfUrl = NormalizeFilePath(req.SamplePdfUrl),
                AuthorId = author.Id,
                CategoryId = defaultCategoryId,
                IsApproved = true
            };

            _context.Books.Add(book);

            req.Status = "Approved";
            _context.BookRequests.Update(req);
            await _context.SaveChangesAsync();

            return book;
        }

        public async Task<bool> RejectRequestAsync(int requestId)
        {
            var req = await _context.BookRequests.FindAsync(requestId);
            if (req == null || req.Status != "Pending") return false;

            req.Status = "Rejected";
            _context.BookRequests.Update(req);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<BookRequestDto>> GetRequestsByUserIdAsync(int userId)
        {
            var requests = await _context.BookRequests
                .Include(r => r.RequestedBy)
                .Where(r => r.RequestedById == userId)
                .ToListAsync();

            return requests.Select(MapToDto);
        }

        // ===============================
        // 📌 Helpers: Mapping
        // ===============================
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
                ImageUrl = NormalizeFilePath(book.ImageUrl),
                SamplePdfUrl = NormalizeFilePath(book.SamplePdfUrl),
                IsApproved = book.IsApproved
            };

        private static BookRequestDto MapToDto(BookRequest req) =>
            new BookRequestDto
            {
                Id = req.Id,
                Title = req.Title,
                AuthorName = req.AuthorName,
                Description = req.Description,
                CoverImageUrl = NormalizeFilePath(req.CoverImageUrl),
                Price = req.Price,
                Genre = req.Genre,
                SamplePdfUrl = NormalizeFilePath(req.SamplePdfUrl),
                Status = req.Status,
                RequestedById = req.RequestedById,
                RequestedByName = req.RequestedBy != null
                    ? $"{req.RequestedBy.FirstName} {req.RequestedBy.LastName}"
                    : string.Empty
            };
    }
}
