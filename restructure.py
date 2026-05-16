import os
import shutil
import json

def restructure():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    mobile_app_dir = os.path.join(root_dir, 'mobile-app')
    archive_dir = os.path.join(root_dir, 'archive')
    
    print("Creating archive for old prototype files...")
    os.makedirs(archive_dir, exist_ok=True)
    
    # Move clutter to archive
    clutter = ['app.py', 'train_and_predict.py', 'start_backend.bat', 'data.json']
    for item in clutter:
        src = os.path.join(root_dir, item)
        dst = os.path.join(archive_dir, item)
        if os.path.exists(src):
            if os.path.exists(dst):
                if os.path.isdir(dst):
                    shutil.rmtree(dst)
                else:
                    os.remove(dst)
            shutil.move(src, dst)
            print(f"Moved {item} to archive/")
            
    print("Moving mobile-app contents to root...")
    if os.path.exists(mobile_app_dir):
        for item in os.listdir(mobile_app_dir):
            src = os.path.join(mobile_app_dir, item)
            dst = os.path.join(root_dir, item)
            
            # Remove existing file in root if conflicts (e.g. package.json)
            if os.path.exists(dst):
                if os.path.isdir(dst):
                    shutil.rmtree(dst)
                else:
                    os.remove(dst)
            
            shutil.move(src, dst)
            print(f"Moved {item} to root")
            
        # Remove empty mobile-app dir
        os.rmdir(mobile_app_dir)
        print("Removed mobile-app folder")
        
    print("Updating vercel.json...")
    vercel_path = os.path.join(root_dir, 'vercel.json')
    vercel_config = {
      "rewrites": [
        {
          "source": "/api/(.*)",
          "destination": "/api/index.py"
        },
        {
          "source": "/(.*)",
          "destination": "/$1"
        }
      ]
    }
    with open(vercel_path, 'w') as f:
        json.dump(vercel_config, f, indent=2)
        
    print("Fixing package.json for Vercel deployment (moving devDependencies to dependencies)...")
    pkg_path = os.path.join(root_dir, 'package.json')
    if os.path.exists(pkg_path):
        with open(pkg_path, 'r') as f:
            pkg = json.load(f)
            
        # Move all devDependencies to dependencies to avoid Vercel dropping Vite in production
        if 'devDependencies' in pkg:
            if 'dependencies' not in pkg:
                pkg['dependencies'] = {}
            for k, v in pkg['devDependencies'].items():
                pkg['dependencies'][k] = v
            del pkg['devDependencies']
            
        with open(pkg_path, 'w') as f:
            json.dump(pkg, f, indent=2)
            
    print("✅ Repository restructured! Ready for Vercel.")

if __name__ == "__main__":
    restructure()
