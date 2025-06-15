# scripts/prepare_magdalena_files.py
import os
import shutil

def prepare_magdalena_files():
    """
    Script para organizar los archivos de Magdalena en la estructura correcta
    """
    
    # Directorio fuente (donde tienes los 52 archivos)
    source_dir = input("Ingresa la ruta donde están tus 52 archivos de Magdalena: ")
    
    # Directorio destino
    dest_dir = "../public/data/magdalena"
    
    # Crear directorio si no existe
    os.makedirs(dest_dir, exist_ok=True)
    
    print(f"Copiando archivos de {source_dir} a {dest_dir}...")
    
    files_copied = 0
    for week in range(1, 53):  # Semanas 1 a 52
        # Buscar archivo para esta semana (pueden tener diferentes formatos)
        possible_names = [
            f"resultado_{week}_69_K.xlsx",
            f"Resultado_{week}_69_K.xlsx",
            f"resultado_semana_{week}_69.xlsx",
            f"semana_{week}_participacion_69.xlsx"
        ]
        
        source_file = None
        for name in possible_names:
            potential_path = os.path.join(source_dir, name)
            if os.path.exists(potential_path):
                source_file = potential_path
                break
        
        if source_file:
            # Copiar con nombre estandardizado
            dest_file = os.path.join(dest_dir, f"resultado_{week}_69_K.xlsx")
            shutil.copy2(source_file, dest_file)
            print(f"✅ Copiado: Semana {week}")
            files_copied += 1
        else:
            print(f"❌ No encontrado: Semana {week}")
    
    print(f"\n🎯 Proceso completado: {files_copied}/52 archivos copiados")
    
    if files_copied > 0:
        print("\n📁 Estructura creada en:")
        print(f"   {dest_dir}/")
        for week in range(1, min(6, files_copied + 1)):
            if os.path.exists(os.path.join(dest_dir, f"resultado_{week}_69_K.xlsx")):
                print(f"   ├── resultado_{week}_69_K.xlsx")
        if files_copied > 5:
            print(f"   └── ... (+{files_copied - 5} archivos más)")
        
        print("\n✨ ¡Listo! Ya puedes usar el modelo de Magdalena en tu plataforma.")
    else:
        print("\n⚠️  No se encontraron archivos. Verifica la ruta y nombres de archivos.")

if __name__ == "__main__":
    prepare_magdalena_files()