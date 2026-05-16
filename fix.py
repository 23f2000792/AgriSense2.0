import os
import shutil

root_dir = os.path.abspath(os.path.dirname(__file__))
src_db = os.path.join(root_dir, 'agrisense.db')
dst_db = os.path.join(root_dir, 'backend', 'agrisense.db')

if os.path.exists(src_db):
    shutil.move(src_db, dst_db)
    print("✅ Moved agrisense.db to backend folder successfully!")
else:
    print("⚠️ agrisense.db not found in root. It might already be in backend/")
