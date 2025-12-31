
import re
import json
import sys

def analyze(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Look for the JSON payload
        match = re.search(r'window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*?\});', content, re.DOTALL)
        if not match:
            # Try another pattern just in case
            match = re.search(r'__LIGHTHOUSE_JSON__\s*:\s*(\{.*?\})', content, re.DOTALL)
            
        if not match:
            print("Could not find __LIGHTHOUSE_JSON__ in the file.")
            return

        json_str = match.group(1)
        data = json.loads(json_str)

        categories = data.get('categories', {})
        perf = categories.get('performance', {})
        print(f"Performance Score: {perf.get('score')}")

        audits = data.get('audits', {})
        
        # Get audits referenced in performance category
        perf_audit_refs = perf.get('auditRefs', [])
        
        print("\n=== Top Improvements ===")
        for ref in perf_audit_refs:
            audit_id = ref.get('id')
            audit = audits.get(audit_id)
            if not audit:
                continue
            
            score = audit.get('score')
            if score is not None and score < 0.9:
                weight = ref.get('weight', 0)
                if weight > 0:
                    print(f"\nAudit: {audit.get('title')} (Score: {score}, Weight: {weight})")
                    print(f"Description: {audit.get('description')}")
                    display_value = audit.get('displayValue')
                    if display_value:
                        print(f"Value: {display_value}")
                    
        # Specific details for LCP
        lcp_audit = audits.get('largest-contentful-paint-element')
        if lcp_audit:
            print("\n--- LCP Element ---")
            details = lcp_audit.get('details', {})
            # Debug: print keys if needed, but let's try to handle structure gracefully
            if details and 'items' in details:
                items = details['items']
                if not items:
                    print("LCP Details Items is empty.")
                for item in items:
                    node = item.get('node', {})
                    if node:
                        print(f"Node: {node.get('nodeLabel')}")
                        print(f"Snippet: {node.get('snippet')}")
                    else:
                        print(f"Item has no node: {item}")
            else:
                print("No details.items found for LCP.")

        # Script Bootup Time (better than main thread for identifying scripts)
        bootup = audits.get('bootup-time')
        if bootup:
             print("\n--- Script Bootup Time (Top 5) ---")
             details = bootup.get('details', {})
             if details and 'items' in details:
                 items = sorted(details['items'], key=lambda x: x.get('total', 0), reverse=True)
                 for item in items[:5]:
                     print(f"URL: {item.get('url')} - Total: {item.get('total')}ms - Scripting: {item.get('scripting')}ms")

        # Network Payloads
        total_byte = audits.get('total-byte-weight')
        if total_byte:
            print("\n--- Total Byte Weight (Top 5) ---")
            details = total_byte.get('details', {})
            if details and 'items' in details:
                 items = sorted(details['items'], key=lambda x: x.get('totalBytes', 0), reverse=True)
                 for item in items[:5]:
                     print(f"URL: {item.get('url')} - Size: {item.get('totalBytes')} bytes")

    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analyze("lighthouse_report.html")
