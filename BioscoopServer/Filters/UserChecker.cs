using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

public class UserCheck : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;

        var role = user.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "User")
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}
