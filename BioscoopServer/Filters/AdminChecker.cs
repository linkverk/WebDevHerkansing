using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

public class AdminCheck : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;

        var role = user.FindFirst("role")?.Value;

        if (role != "Admin")
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}
