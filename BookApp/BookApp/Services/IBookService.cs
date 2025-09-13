using BookApp.Api.Models;
using BookApp.Api.Models.DTOs;

namespace BookApp.Api.Services
{
    public interface IBookService
    {
        // ================================
        // 📌 Core CRUD (All Books)
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
        Task<IEnumerable<BookDto>> FilterAsync(
            string? author,
            string? category,
            string? genre,
            decimal? minPrice,
            decimal? maxPrice);

        // ================================
        // 📌 Admin-only Actions
        // ================================
        Task<Book?> ApproveAsync(int id); // ✅ Approves book (one-way)
        Task<Book?> UpdateApprovalStatusAsync(int id, bool isApproved); // ✅ Toggle status true/false

        // ================================
        // 📌 Book Requests (Author submits, Admin reviews)
        // ================================
        Task<BookRequestDto> SubmitRequestAsync(BookRequestDto request);
        Task<IEnumerable<BookRequestDto>> GetPendingRequestsAsync();
        Task<Book?> ApproveRequestAsync(int requestId);
        Task<bool> RejectRequestAsync(int requestId);
        Task<IEnumerable<BookRequestDto>> GetRequestsByUserIdAsync(int userId);
    }
}
