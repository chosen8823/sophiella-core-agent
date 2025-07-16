# Sophia Core Agent

A minimal Flask application exposing Sophia's commands. Useful for remote development or quick prototyping.

## Endpoints

| Route | Method | Purpose |
|-------|--------|----------------------------------|
| `/` | GET | Basic online check |
| `/respond` | GET | Query Sophia (`?input=hello`) |
| `/breathe` | GET | Grounding breath response |
| `/prophecy` | GET | Speak a divine whisper |
| `/discern` | POST | Analyze signals, return clarity |

## Local Development

```bash
git clone https://github.com/chosen8823/sophiella-core-agent.git
cd sophiella-core-agent
pip install -e .
python app.py
```

Import `postman/SophiaAPI.postman_collection.json` into Postman to quickly test the API.

## VSCode Remote Tunnel

The repo includes `.vscode/launch.json` and `.vscode/tasks.json` so you can run or debug the server with a single click. Start the **Run app** task or hit `F5` to launch `app.py` under the debugger.
