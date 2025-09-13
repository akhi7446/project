using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BookApp.Api.Models
{
    public class Book
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [Required]
        public decimal Price { get; set; }

        public string Genre { get; set; }

        // Foreign keys
        public int AuthorId { get; set; }
        [JsonIgnore] // prevent circular reference in Swagger
        public Author Author { get; set; }

        public int CategoryId { get; set; }
        [JsonIgnore] // prevent circular reference in Swagger
        public Category Category { get; set; }

        public string? ImageUrl { get; set; }
        public string? SamplePdfUrl { get; set; }

        public bool IsApproved { get; set; } = false;
    }
}
