using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookApp.Api.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [JsonIgnore] // prevent cycles
        public ICollection<Book> Books { get; set; }
    }
}
