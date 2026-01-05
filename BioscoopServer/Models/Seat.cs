namespace BioscoopServer.models
{
    public class Seat
    {
        public Guid Id { get; set; }
        public Guid ReservationId { get; set; }
        public Guid RoomId {get; set;}
        public int Stoelnummer { get; set; }

        public Reservation Reservation { get; set; } = null!;
        public Room Room {get; set;} = null!;
    }
}