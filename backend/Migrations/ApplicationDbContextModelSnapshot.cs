using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Backend.Data;

#nullable disable

namespace Backend.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "8.0.0")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            modelBuilder.Entity("Backend.Models.Category", b =>
            {
                b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("integer");
                b.Property<string>("Name").IsRequired().HasColumnType("text");
                b.HasKey("Id");
                b.ToTable("Categories");
            });

            modelBuilder.Entity("Backend.Models.MenuItem", b =>
            {
                b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("integer");
                b.Property<int?>("CategoryId").HasColumnType("integer");
                b.Property<string>("Description").HasColumnType("text");
                b.Property<bool>("Available").HasColumnType("boolean");
                b.Property<string>("Name").IsRequired().HasColumnType("text");
                b.Property<decimal>("Price").HasColumnType("numeric(10,2)");
                b.HasKey("Id");
                b.HasIndex("CategoryId");
                b.ToTable("MenuItems");
            });

            modelBuilder.Entity("Backend.Models.MenuItem", b =>
            {
                b.HasOne("Backend.Models.Category")
                    .WithMany("MenuItems")
                    .HasForeignKey("CategoryId")
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
