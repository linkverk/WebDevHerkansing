using BioscoopServer.models;
using Microsoft.EntityFrameworkCore;

namespace BioscoopServer.Data
{
    public static class DatabaseSeeder
    {
        public static void SeedDemoAccount(CinemaContext context)
        {
            // Check if demo account already exists
            var demoEmail = "johndoe@test.test";
            var existingUser = context.Users.FirstOrDefault(u => u.Email == demoEmail);

            if (existingUser == null)
            {
                // Create demo account
                var demoUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = demoEmail,
                    Password = "123456", // Note: In production, this should be hashed!
                    FirstName = "John",
                    LastName = "Doe"
                };

                context.Users.Add(demoUser);
                context.SaveChanges();

                Console.WriteLine($"✅ Demo account created: {demoEmail}");
                Console.WriteLine($"   User ID: {demoUser.Id}");
            }
            else
            {
                Console.WriteLine($"ℹ️  Demo account already exists: {demoEmail}");
                Console.WriteLine($"   User ID: {existingUser.Id}");
            }
        }
    }
}