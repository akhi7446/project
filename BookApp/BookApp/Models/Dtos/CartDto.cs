namespace BookApp.Api.Models.DTOs
{
    public class CartDto
    {
        public int BookId { get; set; }
        public string Title { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
