namespace Backend.Models
{
    public static class OrderStatuses
    {
        public const string Received = "Received";
        public const string Preparing = "Preparing";
        public const string Ready = "Ready";
        public const string Delivered = "Delivered";
        public const string Cancelled = "Cancelled";

        public static readonly string[] All =
        [
            Received, Preparing, Ready, Delivered, Cancelled
        ];
    }
}
