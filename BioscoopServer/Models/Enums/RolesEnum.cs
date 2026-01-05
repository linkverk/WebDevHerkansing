using System.Runtime.Serialization;
namespace BioscoopServer.Models.Enums
{
    public enum Roles
    {
        [EnumMember(Value = "Admin")]
        Admin,

        [EnumMember(Value = "User")]
        User,
    }
}