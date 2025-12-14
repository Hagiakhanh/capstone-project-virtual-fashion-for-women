using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public static class OrderShippingStateHelper
    {

        private static readonly List<OrderStatusEnum> ShippingFlow = new()
        {
        OrderStatusEnum.Packed,
        OrderStatusEnum.Delivering,
        OrderStatusEnum.Delivered
        };

        private static readonly List<OrderStatusEnum> ReturnFlow = new()
        {
        OrderStatusEnum.Delivering,
        OrderStatusEnum.Returning,
        OrderStatusEnum.Returned
        };


        public static List<string> BuildTransitionPath(
    string currentStatus,
    string targetStatus)
        {
            if (!Enum.TryParse(currentStatus, out OrderStatusEnum originalCurrent))
                return new List<string>();

            if (!Enum.TryParse(targetStatus, out OrderStatusEnum targetEnum))
                return new List<string>();

            OrderStatusEnum currentEnum = originalCurrent;

            OrderStatusEnum? forcedFirstState = null;

            if (originalCurrent == OrderStatusEnum.Packed && IsReturnFlow(targetEnum))
            {
                forcedFirstState = OrderStatusEnum.Delivering;
                currentEnum = OrderStatusEnum.Delivering;
            }

            List<OrderStatusEnum> path;

            if (IsReturnFlow(targetEnum))
            {
                path = BuildPath(ReturnFlow, currentEnum, targetEnum);
            }
            else
            {
                path = BuildPath(ShippingFlow, currentEnum, targetEnum);
            }

            if (forcedFirstState.HasValue)
            {
                path.Insert(0, forcedFirstState.Value);
            }

            return path.Select(x => x.ToString()).ToList();
        }


        private static bool IsReturnFlow(OrderStatusEnum status)
        {
            return status == OrderStatusEnum.Returning
                   || status == OrderStatusEnum.Returned;
        }

        private static List<OrderStatusEnum> BuildPath(
            List<OrderStatusEnum> flow,
            OrderStatusEnum current,
            OrderStatusEnum target)
        {
            int startIndex = flow.IndexOf(current);
            int endIndex = flow.IndexOf(target);

            if (startIndex == -1 || endIndex == -1 || startIndex >= endIndex)
                return new List<OrderStatusEnum>();

            return flow
                .Skip(startIndex + 1)
                .Take(endIndex - startIndex)
                .ToList();
        }
    }

}
