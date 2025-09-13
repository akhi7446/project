using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BookApp.Api.Models
{
    public class Author
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public int UserId { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore] // prevent cycles
        public User User { get; set; }

        [JsonIgnore] // prevent cycles
        public ICollection<Book> Books { get; set; }
    }
}
