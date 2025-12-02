namespace BioscoopServer.Models.ModelsDTOs
{
    public class ReviewDTO
    {
        public string Id {get;set;}
        public string UserId {get; set;}

        public string FilmId {get; set;}

        public int? Rating {get; set;}

        public string? Description {get; set;}

    }
}