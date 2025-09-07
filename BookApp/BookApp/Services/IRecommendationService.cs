using BookApp.Api.Models.DTOs;

namespace BookApp.Api.Services
{
    public interface IRecommendationService
    {
        Task<IEnumerable<BookDto>> GetRecommendationsAsync(string query);
    }
}
