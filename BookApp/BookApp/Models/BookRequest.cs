using System.Text.Json.Serialization;

namespace BookApp.Api.Models
{
    public class BookRequest
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; }
        public decimal Price { get; set; }
        public string Genre { get; set; } = string.Empty;
        public string? SamplePdfUrl { get; set; }
        public string Status { get; set; } = "Pending";

        public int RequestedById { get; set; }

        [JsonIgnore] // prevent cycles
        public User? RequestedBy { get; set; }
        public int? CategoryId { get; set; }

    }
}
