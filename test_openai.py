from openai import OpenAI

client = OpenAI()

memo = """
社長プレゼンの改善ポイント
- 結論が弱い
- 次アクションが不明確
- スライド枚数が多く、メッセージが散っている
- 経営判断に必要な論点を先頭に置きたい
"""

response = client.responses.create(
    model="gpt-5.4",
    input=f"""
以下のメモを整理してください。

出力形式:
1. 結論
2. 主要課題
3. 改善案
4. 次アクション

メモ:
{memo}
"""
)

print(response.output_text)