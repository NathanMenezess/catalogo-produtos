import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

def upload_image(file):
    result = cloudinary.uploader.upload(
        file.file,
        folder="catalogo-produtos"  # pasta no Cloudinary
    )
    # Retornar URL e public_id
    return result["secure_url"], result["public_id"]

def delete_image(public_id: str):
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        print("Erro ao deletar imagem:", e)
