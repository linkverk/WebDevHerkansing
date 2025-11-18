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

    }
}
