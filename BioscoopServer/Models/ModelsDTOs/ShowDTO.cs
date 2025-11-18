namespace BioscoopServer.Models.ModelsDTOs
{
    public class ShowDTO
    {
        public string? Id { get; set; }
        public string? FilmId { get; set; }
        public string? RoomId { get; set; }
        public DateTime? Begintijd { get; set; }
        public DateTime? Eindtijd { get; set; }
    }
}