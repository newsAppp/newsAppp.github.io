# SRC_DIR="/home/lucky/plan/frontend/build"
# DST_DIR="/home/lucky/plan/"

# SRC_DIR="/home/lucky/plan/"
# DST_DIR="/home/ubuntu/plan/"

# SRC_DIR="/home/lucky/Code/youtube-summarizer"
# DST_DIR="/home/lucky/youtube-summarizer"

# SRC_DIR="/home/lucky/open_course/backend"
# DST_DIR="/home/lucky/open_course/backend"

SRC_DIR="/home/lucky/Code/newsflash/frontend/build"
DST_DIR="/home/ubuntu/build_news_flash"

# SRC_DIR="/home/lucky/news-flash-next"
# DST_DIR="/home/ubuntu/newsflash/frontend"


# SRC_DIR="/home/lucky/open_course/build"
# DST_DIR="/home/lucky/applysmart/demo_freelance_market"

# PEM_FILE="~/keys/aws_2.pem"
# REMOTE="ubuntu@ec2-13-233-83-206.ap-south-1.compute.amazonaws.com"

PEM_FILE="~/.keys/aws_3.pem"
REMOTE="ubuntu@13.201.102.24"

# PEM_FILE="~/keys/aws_3.pem"
# REMOTE="ubuntu@ec2-52-66-200-156.ap-south-1.compute.amazonaws.com"


tar --exclude='env' \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.pyc' \
    --exclude='*.db' \
    -czf - -C ${SRC_DIR} . | ssh -i ${PEM_FILE} ${REMOTE} "mkdir -p ${DST_DIR} && tar -xzf - -C ${DST_DIR}"

echo "✅ Code transferred from '${SRC_DIR}' to '${REMOTE}:${DST_DIR}' ."

# ssh -i  ~/keys/google3 lucky@34.93.122.129
# "ubuntu@ec2-13-233-83-206.ap-south-1.compute.amazonaws.com"







