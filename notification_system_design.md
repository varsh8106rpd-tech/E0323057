# Stage 1 - Notification System API Design

## Core Actions

1. View notifications
2. View unread notifications
3. Mark notification as read
4. Mark all notifications as read
5. Create notification
6. Real-time notification delivery

### GET /api/notifications

Headers:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:18Z"
    }
  ]
}
```

### GET /api/notifications/unread

Headers:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "notifications": []
}
```

### PATCH /api/notifications/{id}/read

Response:

```json
{
  "message": "Notification marked as read"
}
```

### PATCH /api/notifications/read-all

Response:

```json
{
  "message": "All notifications marked as read"
}
```

### POST /api/notifications

Request:

```json
{
  "studentId": 1042,
  "type": "Placement",
  "message": "CSX Corporation hiring"
}
```

Response:

```json
{
  "notificationId": "uuid",
  "message": "Notification created successfully"
}
```

### Real-Time Notifications

Use WebSockets.

Flow:

1. Student logs in.
2. Client opens WebSocket connection.
3. Notification service pushes events instantly.
4. Client updates UI without page refresh.

---

# Stage 2 - Database Design

## Database Choice

PostgreSQL

### Why PostgreSQL?

* Strong ACID guarantees
* Reliable transactions
* Excellent indexing support
* Suitable for notification workloads
* Supports partitioning at scale

## Tables

### Students

```sql
CREATE TABLE students (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);
```

### Notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id BIGINT,
    notification_type VARCHAR(20),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (student_id)
    REFERENCES students(id)
);
```

### Fetch Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = ?
ORDER BY created_at DESC;
```

### Fetch Unread Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = ?
AND is_read = FALSE
ORDER BY created_at DESC;
```

### Mark Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = ?;
```

### Scaling Challenges

* Table growth
* Slow queries
* Increased storage

Solutions:

* Indexes
* Partitioning
* Archiving old notifications
* Read replicas

---

# Stage 3 - Query Optimization

Problematic Query:

```sql
SELECT *
FROM notifications
WHERE studentId = 1042
AND isRead = FALSE
ORDER BY createdAt DESC;
```

### Why Slow?

Without indexes the database performs a full table scan.

With 5,000,000 notifications:

```text
O(N)
```

cost becomes expensive.

### Recommended Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications
(student_id, is_read, created_at DESC);
```

### Computation Cost

Indexed lookup:

```text
O(log N)
```

instead of:

```text
O(N)
```

### Should We Index Every Column?

No.

Problems:

* Increased storage
* Slower inserts
* Slower updates
* Higher maintenance cost

Indexes should only be created for frequently queried columns.

### Placement Notifications in Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Stage 4 - Scaling Notification Reads

Problem:

Every page load hits the database.

### Solutions

#### Redis Cache

Pros:

* Very fast reads
* Reduces DB load

Cons:

* Cache invalidation complexity

#### Pagination

Pros:

* Smaller query sizes

Cons:

* Additional API complexity

#### WebSocket Push

Pros:

* Eliminates constant polling

Cons:

* Persistent connection management

#### Read Replicas

Pros:

* Offloads read traffic

Cons:

* Replication lag

Recommended Architecture:

PostgreSQL + Redis + WebSockets + Read Replicas

---

# Stage 5 - Reliable Mass Notification Delivery

Problems in Existing Code

* Sequential processing
* Slow execution
* Partial failures
* No retry mechanism
* Not scalable

### Improved Design

Use:

* Message Queue
* Worker Processes
* Retry Mechanism
* Dead Letter Queue

### Revised Pseudocode

```text
function notify_all(student_ids, message):

    notification_id = save_notification_batch(message)

    for student_id in student_ids:
        queue.publish({
            student_id,
            notification_id
        })
```

Worker:

```text
while true:

    job = queue.consume()

    try:
        save_to_db(job)

        send_email(job)

        push_to_app(job)

    catch error:
        retry(job)

        if retries_exceeded:
            move_to_dead_letter_queue(job)
```

### Should Email and DB Save Happen Together?

No.

Database write should occur first.

Email delivery should be asynchronous using a queue.

This prevents notification loss and improves scalability.

---

# Stage 6 - Priority Inbox Design

Priority Formula:

```text
Priority Score =
Notification Weight + Recency Score
```

Weights:

```text
Placement = 3
Result = 2
Event = 1
```

Approach:

1. Assign weight.
2. Calculate recency.
3. Compute priority score.
4. Maintain Top 10 using a Min Heap.

Complexity:

```text
Insert: O(log 10)
Top 10 retrieval: O(10)
```

This efficiently supports continuous arrival of new notifications.
