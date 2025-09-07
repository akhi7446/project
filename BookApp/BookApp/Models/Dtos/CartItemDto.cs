namespace BookApp.Api.Models.DTOs
{
    public class CartItemDto
    {
        public int BookId { get; set; }
        public string Title { get; set; } = "";
        public string AuthorName { get; set; } = "";
        public string CategoryName { get; set; } = "";
        public string Genre { get; set; } = "";
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string ImageUrl { get; set; } = "";
    }
}
