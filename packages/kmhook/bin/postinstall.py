import os
import shutil


def delete_files_except_node(directory):
    """
    Recursively deletes files and directories in the given directory except files with .node extension.
    
    :param directory: The directory to clean up
    """
    for root, dirs, files in os.walk(directory, topdown=False):
        for name in files:
            file_path = os.path.join(root, name)
            if not file_path.endswith('.node'):
                os.remove(file_path)
                # print(f"Deleted file: {file_path}")

        for name in dirs:
            dir_path = os.path.join(root, name)
            if not os.listdir(dir_path):  # Check if directory is empty
                shutil.rmtree(dir_path)
                # print(f"Deleted directory: {dir_path}")


delete_files_except_node(os.path.join(os.path.dirname(__file__), '..', 'build'))
