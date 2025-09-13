namespace BookApp.Api.Models.DTOs
{
    public class BookRequestDto
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
        public string RequestedByName { get; set; } = string.Empty;
        public int? CategoryId { get; set; }

    }
}
