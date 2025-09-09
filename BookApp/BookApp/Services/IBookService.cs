using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;

namespace BookApp.Api.Services
{
    public interface IBookService
    {
        // ================================
        // 📌 Core CRUD (Approved Books)
        // ================================
        Task<IEnumerable<BookDto>> GetAllAsync();
        Task<BookDto?> GetByIdAsync(int id);
        Task<BookDto> CreateAsync(BookDto dto, bool isApproved = true);
        Task<BookDto?> UpdateAsync(int id, BookDto dto);
        Task<bool> DeleteAsync(int id);

        // ================================
        // 📌 Queries (Approved Books only)
        // ================================
        Task<IEnumerable<BookDto>> SearchAsync(string query);
        Task<IEnumerable<BookDto>> FilterAsync(string? author, string? category, string? genre, decimal? minPrice, decimal? maxPrice);

        // ================================
        // 📌 Admin-only Actions
        // ================================
        Task<Book?> ApproveAsync(int id);

        // ================================
        // 📌 Book Requests (Author submits, Admin reviews)
        // ================================
        Task<BookRequest> SubmitRequestAsync(BookRequest request);   // Author → submit book request
        Task<IEnumerable<BookRequest>> GetPendingRequestsAsync();    // Admin → get pending requests
        Task<Book?> ApproveRequestAsync(int requestId);              // Admin → approve request
        Task<bool> RejectRequestAsync(int requestId);                // Admin → reject request
        Task<IEnumerable<BookRequest>> GetRequestsByUserIdAsync(int userId);

    }
}
