namespace BioscoopServer.Models.ModelsDTOs
{
    public class ReviewDTO
    {
        public Guid Id {get;set;}
        public Guid UserId {get; set;}

        public Guid FilmId {get; set;}

        public int? Rating {get; set;}

        public string? Description {get; set;}

    }
}