"""
Fix permission issues in views
"""
import re

# Fix operators/views.py
operators_views_path = 'src/apps/operators/views.py'
with open(operators_views_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace MyOperatorView permission
content = re.sub(
    r'class MyOperatorView\(TimingMixin, SuccessResponseMixin, APIView\):\s+"""Get current operator details"""\s+permission_classes = \[IsAuthenticated, IsOperator\]',
    'class MyOperatorView(TimingMixin, SuccessResponseMixin, APIView):\n    """Get current operator details"""\n    permission_classes = [IsAuthenticated]',
    content
)

# Add role check in MyOperatorView get method
content = re.sub(
    r'(class MyOperatorView.*?def get\(self, request\):)\s+try:',
    r'\1\n        # Check if user is operator or GRAK staff\n        if not hasattr(request.user, "role") or request.user.role not in ["operator_admin", "grak_admin", "grak_officer"]:\n            return self.error_response(\n                message="Access denied. Operator or GRAK staff role required.",\n                status_code=status.HTTP_403_FORBIDDEN\n            )\n        \n        try:',
    content,
    flags=re.DOTALL
)

with open(operators_views_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed operators/views.py")

# Fix nser/views.py
nser_views_path = 'src/apps/nser/views.py'
with open(nser_views_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace ExclusionStatisticsView permission
content = re.sub(
    r'(class ExclusionStatisticsView.*?""".*?""")\s+permission_classes = \[IsAuthenticated, IsGRAKStaff\]',
    r'\1\n    permission_classes = [IsAuthenticated]',
    content,
    flags=re.DOTALL
)

# Add role check in ExclusionStatisticsView get method
content = re.sub(
    r'(class ExclusionStatisticsView.*?def get\(self, request\):)\s+(# Try cache first)',
    r'\1\n        # Check if user has permission\n        if not hasattr(request.user, "role") or request.user.role not in ["grak_admin", "grak_officer"]:\n            return self.error_response(\n                message="Access denied. GRAK staff role required.",\n                status_code=status.HTTP_403_FORBIDDEN\n            )\n        \n        \2',
    content,
    flags=re.DOTALL
)

with open(nser_views_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed nser/views.py")
print("All permission fixes applied successfully!")
