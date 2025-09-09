namespace BookApp.Api.Models
{
    public class BookRequest
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty ;
        public string Description { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; }
        public decimal Price { get; set; }
        public string Genre { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public int RequestedById { get; set; }
        public User? RequestedBy { get; set; }
    }
}
