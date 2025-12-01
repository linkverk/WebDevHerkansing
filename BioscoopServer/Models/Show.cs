namespace BioscoopServer.models
{
    public class Show
    {
        public Guid Id { get; set; }
        public Guid FilmId { get; set; }
        public Guid RoomId { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }

        public Film Film { get; set; } = null!;
        public Room Zaal { get; set; } = null!;
        public List<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}