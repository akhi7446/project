using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BookApp.Api.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")] // ✅ fixed missing bracket
        [Required]
        public decimal Price { get; set; }

        public string Genre { get; set; }

        // Foreign keys
        public int AuthorId { get; set; }
        public Author Author { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; }

        public string? ImageUrl { get; set; }

        // Admin approval
        public bool IsApproved { get; set; } = false;
    }
}
