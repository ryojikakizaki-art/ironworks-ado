#!/usr/bin/env python3
"""
IRONWORKS ado 図面エージェント MCP サーバー
Claude Code から直接呼び出せるMCPツールとして図面生成を提供する

起動方法:
  python3 mcp_server.py

Claude Code settings.json への登録:
  "mcpServers": {
    "drafting-agent": {
      "command": "python3",
      "args": ["<path>/drafting-agent/mcp_server.py"]
    }
  }
"""
import json
import sys
import base64
import os

# drawing モジュールのパスを追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from drawing.generator import generate_drawing_pdf


def read_message():
    """stdin から JSON-RPC メッセージを読み取る"""
    header = ""
    while True:
        line = sys.stdin.readline()
        if line == "\r\n" or line == "\n":
            break
        header += line

    content_length = 0
    for h in header.strip().split("\n"):
        if h.lower().startswith("content-length:"):
            content_length = int(h.split(":")[1].strip())

    if content_length == 0:
        return None

    body = sys.stdin.read(content_length)
    return json.loads(body)


def send_message(msg):
    """stdout に JSON-RPC メッセージを送信"""
    body = json.dumps(msg)
    header = f"Content-Length: {len(body)}\r\n\r\n"
    sys.stdout.write(header)
    sys.stdout.write(body)
    sys.stdout.flush()


def handle_initialize(msg):
    return {
        "jsonrpc": "2.0",
        "id": msg["id"],
        "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {},
            },
            "serverInfo": {
                "name": "ironworks-drafting-agent",
                "version": "0.1.0",
            },
        },
    }


def handle_tools_list(msg):
    return {
        "jsonrpc": "2.0",
        "id": msg["id"],
        "result": {
            "tools": [
                {
                    "name": "generate_drawing",
                    "description": (
                        "IRONWORKS ado の手すり製品のJIS準拠図面PDFを生成します。"
                        "製品名(antoine/noel/mignon/marie)、寸法、材質、仕上げを指定してください。"
                        "生成されたPDFはbase64エンコードで返されます。"
                    ),
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "drawing_title": {
                                "type": "string",
                                "description": "図面タイトル（例: 'Antoine 手すり 2300mm'）",
                            },
                            "product": {
                                "type": "string",
                                "enum": ["antoine", "noel", "mignon", "marie"],
                                "description": "製品名",
                            },
                            "material": {
                                "type": "string",
                                "description": "材質（例: 'SS400 丸鋼 φ25.4'）",
                                "default": "SS400 丸鋼",
                            },
                            "finish": {
                                "type": "string",
                                "description": "仕上げ（例: '黒皮鉄仕上げ', '亜鉛メッキ'）",
                                "default": "黒皮鉄仕上げ",
                            },
                            "length": {
                                "type": "number",
                                "description": "手すり全長 (mm)",
                            },
                            "pipe_diameter": {
                                "type": "number",
                                "description": "パイプ外径 (mm)",
                                "default": 25.4,
                            },
                            "height": {
                                "type": "number",
                                "description": "取付高さ (mm)。水平手すりの場合のみ",
                                "default": 800,
                            },
                            "bracket_count": {
                                "type": "integer",
                                "description": "ブラケット数",
                                "default": 2,
                            },
                            "bracket_type": {
                                "type": "string",
                                "description": "ブラケットタイプ（A/B/C）",
                                "default": "A",
                            },
                            "notes": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "注記リスト",
                                "default": [],
                            },
                            "output_path": {
                                "type": "string",
                                "description": "PDFの保存先パス。指定するとファイルに書き出します",
                            },
                        },
                        "required": ["product", "length"],
                    },
                },
            ],
        },
    }


def handle_tools_call(msg):
    params = msg.get("params", {})
    tool_name = params.get("name")
    args = params.get("arguments", {})

    if tool_name == "generate_drawing":
        return _handle_generate_drawing(msg, args)

    return {
        "jsonrpc": "2.0",
        "id": msg["id"],
        "result": {
            "content": [
                {"type": "text", "text": f"Unknown tool: {tool_name}"}
            ],
            "isError": True,
        },
    }


def _handle_generate_drawing(msg, args):
    try:
        spec = {
            "drawing_title": args.get("drawing_title", f"{args.get('product', '')} 手すり"),
            "product": args.get("product", "antoine"),
            "material": args.get("material", "SS400 丸鋼"),
            "finish": args.get("finish", "黒皮鉄仕上げ"),
            "scale": "1:10",
            "dimensions": {
                "length": args.get("length", 2000),
                "pipe_diameter": args.get("pipe_diameter", 25.4),
                "height": args.get("height", 800),
                "bracket_count": args.get("bracket_count", 2),
                "bracket_type": args.get("bracket_type", "A"),
            },
            "notes": args.get("notes", []),
        }

        pdf_bytes = generate_drawing_pdf(spec)

        # ファイル保存（output_pathが指定されている場合）
        output_path = args.get("output_path")
        if output_path:
            os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(pdf_bytes)
            result_text = (
                f"図面PDFを生成・保存しました。\n"
                f"ファイル: {output_path}\n"
                f"サイズ: {len(pdf_bytes)} bytes\n"
                f"タイトル: {spec['drawing_title']}\n"
                f"製品: {spec['product']}\n"
                f"寸法: 全長{spec['dimensions']['length']}mm, "
                f"φ{spec['dimensions']['pipe_diameter']}mm"
            )
        else:
            pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
            result_text = (
                f"図面PDFを生成しました（base64）。\n"
                f"サイズ: {len(pdf_bytes)} bytes\n"
                f"タイトル: {spec['drawing_title']}\n"
                f"製品: {spec['product']}\n"
                f"寸法: 全長{spec['dimensions']['length']}mm, "
                f"φ{spec['dimensions']['pipe_diameter']}mm\n\n"
                f"base64 data (最初の100文字): {pdf_b64[:100]}...\n\n"
                f"ファイルに保存するには output_path パラメータを指定してください。"
            )

        return {
            "jsonrpc": "2.0",
            "id": msg["id"],
            "result": {
                "content": [
                    {"type": "text", "text": result_text}
                ],
            },
        }

    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "id": msg["id"],
            "result": {
                "content": [
                    {"type": "text", "text": f"エラー: {str(e)}"}
                ],
                "isError": True,
            },
        }


def main():
    """MCP サーバーメインループ"""
    while True:
        msg = read_message()
        if msg is None:
            break

        method = msg.get("method", "")

        if method == "initialize":
            send_message(handle_initialize(msg))
        elif method == "notifications/initialized":
            pass  # 通知は応答不要
        elif method == "tools/list":
            send_message(handle_tools_list(msg))
        elif method == "tools/call":
            send_message(handle_tools_call(msg))
        elif method == "notifications/cancelled":
            pass
        else:
            # 未知のメソッド
            if "id" in msg:
                send_message({
                    "jsonrpc": "2.0",
                    "id": msg["id"],
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}",
                    },
                })


if __name__ == "__main__":
    main()
