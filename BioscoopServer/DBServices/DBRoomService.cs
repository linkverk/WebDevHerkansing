using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;
namespace BioscoopServer.DBServices
{
    public class DBRoomService : DBDefaultService<Room>
    {
        public DBRoomService(CinemaContext context) : base(context) { }
        public override bool Exists(Room entity, out Room? existing)
        {
            existing = _dbSet.AsNoTracking().FirstOrDefault(f => f.Id == entity.Id);
            return existing != null;
        }

        public async Task<List<Room>> GetRoomsFull()
        {
            return await _dbSet
            .AsNoTracking()
            .Include(f => f.Shows)
            .ToListAsync();
        }

    }
}
