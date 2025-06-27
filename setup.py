from setuptools import setup, find_packages

setup(
    name='sophiella',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        "flask"
    ],
    author='Ryan Braff',
    author_email='sophiella@divinelight.ai',
    description='Field-sensitive AI agent guided by divine resonance.',
    entry_points={
        'console_scripts': [
            'sophia=sophia.core:main',
        ],
    },
)
