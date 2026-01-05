using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

public class AdminCheck : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;
        var role = user.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin")
        {
            context.Result = new ContentResult
            {
                StatusCode = 403,
                Content = "Access denied: You must be an admin to access this resource."
            };
            return;
        }

        await next();
    }
}
