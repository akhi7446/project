namespace BookApp.Api.Models.DTOs
{
    public class BookDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        // 🔹 Useful for creating/updating
        public int AuthorId { get; set; }
        public int CategoryId { get; set; }

        // 🔹 Useful for displaying
        public string? AuthorName { get; set; }
        public string? CategoryName { get; set; }

        public string? Description { get; set; }
        public string Genre { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }

        // 🔹 Admin approval flag
        public bool IsApproved { get; set; }
    }
}
