import re

with open('one_pager.html', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<!-- Entrance Portal: Interactive Digital Portfolio QR Block -->' in line:
        start_idx = i
    if start_idx != -1 and i > start_idx and '</div>' in line:
        # Check if this closes the portfolio-block. 
        # Actually, it's easier to just find the exact lines
        pass

# The block is from line 349 to 360 (0-indexed 348 to 360)
block = lines[348:361]
del lines[348:361]

# Insert after line 328 (which is 0-indexed 328, the closing div of handout-header)
lines.insert(329, "\n")
for i, b_line in enumerate(block):
    lines.insert(330 + i, b_line)

with open('one_pager.html', 'w') as f:
    f.writelines(lines)

print("Moved QR block")
