namespace BioscoopServer.Models.ModelsDTOs
{
    public class ShowDTO
    {
        public string? Id { get; set; }
        public string? FilmId { get; set; }
        public string? RoomId { get; set; }
        public DateTime? startDate { get; set; }
        public DateTime? endDate { get; set; }
    }
}