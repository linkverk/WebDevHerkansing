namespace BioscoopServer.Models.ModelsDTOs
{
    public class ShowDTO
    {
        public string? Id { get; set; }
        public string? FilmId { get; set; }
        public string? RoomId { get; set; }
        public DateTimeOffset? startDate { get; set; }
        public DateTimeOffset? endDate { get; set; }
    }
}