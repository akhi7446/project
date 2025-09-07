using BookApp.Api.Models.DTOs;
using Newtonsoft.Json.Linq;

namespace BookApp.Api.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly HttpClient _httpClient;

        public RecommendationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IEnumerable<BookDto>> GetRecommendationsAsync(string query)
        {
            var url = $"https://openlibrary.org/search.json?q={Uri.EscapeDataString(query)}&limit=5";
            var response = await _httpClient.GetStringAsync(url);
            var json = JObject.Parse(response);

            var books = json["docs"]
                .Take(5)
                .Select(b => new BookDto
                {
                    Id = 0, // external books don’t have DB IDs
                    Title = b["title"]?.ToString() ?? "Unknown Title",
                    AuthorName = b["author_name"]?.FirstOrDefault()?.ToString() ?? "Unknown Author",
                    CategoryName = "N/A",
                    Genre = "N/A",
                    Price = 0, // no price from OpenLibrary
                    ImageUrl = b["cover_i"] != null
                        ? $"https://covers.openlibrary.org/b/id/{b["cover_i"]}-M.jpg"
                        : ""
                })
                .ToList();

            return books;
        }
    }
}
