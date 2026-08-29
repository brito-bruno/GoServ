using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace Backend.Services
{
    /// <summary>Converte qualquer imagem suportada para JPEG compacto antes de gravar no banco.</summary>
    public static class ImageConverter
    {
        public const int MaxWidth = 800;
        public const int JpegQuality = 75;
        public const long MaxUploadBytes = 5 * 1024 * 1024;

        public static (byte[] Data, string ContentType) ToStoredJpeg(Stream input)
        {
            using var image = Image.Load(input);

            if (image.Width > MaxWidth)
            {
                image.Mutate(ctx => ctx.Resize(new ResizeOptions
                {
                    Size = new Size(MaxWidth, 0),
                    Mode = ResizeMode.Max
                }));
            }

            using var output = new MemoryStream();
            image.SaveAsJpeg(output, new JpegEncoder { Quality = JpegQuality });
            return (output.ToArray(), "image/jpeg");
        }
    }
}
