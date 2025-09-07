namespace BookApp.Api.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        public int Quantity { get; set; } = 1;

        public int UserId { get; set; }
        public User User { get; set; }

        public int BookId { get; set; }
        public Book Book { get; set; }
    }
}
