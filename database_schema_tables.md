# Database Layout & Configurations

## users Collection

| Field | Type | Required | Constraints / Notes |
|-------|------|----------|---------------------|
| _id | ObjectId | yes | Auto-generated |
| name | String | yes |  |
| email | String | yes | unique |
| password | String | yes | hashed with bcrypt |
| role | String | no | enum: admin, teacher, student (default student) |
| avatar | String | no | URL or base-64 |
| phone | String | no |  |
| createdAt | Date | no | default Date.now |

## students Collection

| Field | Type | Required | Constraints / Notes |
|-------|------|----------|---------------------|
| _id | ObjectId | yes |  |
| studentId | String | yes | unique |
| name | String | yes |  |
| email | String | yes | may mirror users.email |
| phone | String | no |  |
| class | String | yes | e.g. 10-A |
| section | String | no |  |
| dateOfBirth | Date | no |  |
| gender | String | no | enum: male, female, other |
| address | String | no |  |
| parentName | String | no |  |
| parentPhone | String | no |  |
| admissionDate | Date | no | default Date.now |
| status | String | no | enum: active, inactive (default active) |
| performance.gpa | Number | no | default 0 |
| performance.attendance | Number | no | default 0 |
| performance.rank | Number | no |  |

## attendances Collection

| Field | Type | Required | Constraints / Notes |
|-------|------|----------|---------------------|
| _id | ObjectId | yes |  |
| studentId | String | yes | FK → students.studentId |
| date | Date | yes |  |
| status | String | yes | present, absent, late, excused |
| class | String | yes | same as students.class |
| period | String | no |  |
| markedBy | String | no | teacher id/email |
| timestamp | Date | no | default Date.now |

## Connection Settings

| Key | Example |
|-----|---------|
| MONGODB_URI | mongodb+srv://user:pass@cluster0.mongodb.net/eduadmin |
| Database | eduadmin |
| Mongoose Version | ^8.x |
| Pool Size | default |
