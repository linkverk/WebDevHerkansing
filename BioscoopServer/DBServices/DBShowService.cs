using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;
namespace BioscoopServer.DBServices
{
    public class DBShowService : DBDefaultService<Show>
    {
        public DBShowService(CinemaContext context) : base(context) { }
        public override bool Exists(Show entity, out Show? existing)
        {
            existing = _dbSet.AsNoTracking().FirstOrDefault(f => f.Id == entity.Id);
            return existing != null;
        }
        public override async Task<bool> Valid(Show entity)
        {
            List<Show>? shows = _dbSet.AsNoTracking()
            .Where(s => s.RoomId == entity.RoomId && s.Id != entity.Id).ToList();

            if (shows == null || shows.Count() == 0)
            {
                return true;
            }
            else
            {
                foreach (Show show in shows)
                {
                    if (show.StartDate <= entity.EndDate && show.StartDate >= entity.StartDate || show.EndDate <= entity.EndDate && show.EndDate >= entity.StartDate || show.EndDate >= entity.EndDate && show.StartDate <= entity.StartDate || show.EndDate == entity.EndDate && show.StartDate == entity.StartDate)
                    {
                        return false;
                    }
                }
            }
            return true;
        }
    }
}
