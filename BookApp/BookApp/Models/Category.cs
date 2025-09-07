using System.ComponentModel.DataAnnotations;

namespace BookApp.Api.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required] public string Name { get; set; }

        public ICollection<Book> Books { get; set; }
    }
}
