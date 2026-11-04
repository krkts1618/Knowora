import { Collection, DocumentItem, Topic } from '@/types';

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-java',
    name: 'Java Development',
    description: 'Enterprise backend development, Spring framework ecosystem, JPA, and JVM internals.',
    color: 'amber',
    icon: 'code',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-10-12T14:30:00Z',
    documentIds: ['doc-spring-boot'],
  },
  {
    id: 'col-ml',
    name: 'Machine Learning',
    description: 'Core statistical learning algorithms, supervised & unsupervised paradigms, and evaluation metrics.',
    color: 'emerald',
    icon: 'cpu',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-10-13T16:45:00Z',
    documentIds: ['doc-ml-revision'],
  },
  {
    id: 'col-web',
    name: 'Web Development',
    description: 'Modern frontend systems, component architecture, reactive state, and single-page routing.',
    color: 'cyan',
    icon: 'layers',
    createdAt: '2026-09-01T08:30:00Z',
    updatedAt: '2026-10-14T08:15:00Z',
    documentIds: ['doc-react-notes'],
  },
  {
    id: 'col-networks',
    name: 'Computer Networks',
    description: 'Telecommunications protocols, layered network architectures, framing, and reliability mechanisms.',
    color: 'forest',
    icon: 'network',
    createdAt: '2026-09-12T10:15:00Z',
    updatedAt: '2026-10-11T12:00:00Z',
    documentIds: ['doc-net-fundamentals'],
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-spring-boot',
    collectionId: 'col-java',
    title: 'Spring Boot Notes',
    description: 'Comprehensive study guide covering foundational Spring Boot patterns, IoC, MVC dispatching, and Hibernate/JPA.',
    type: 'notes',
    originalFileName: 'Spring_Boot_Mastery_v2.pdf',
    fileSize: '4.8 MB',
    isBookmarked: true,
    isTrash: false,
    createdAt: '2026-08-10T09:30:00Z',
    updatedAt: '2026-10-12T14:30:00Z',
    topicIds: [
      'topic-spring-intro',
      'topic-spring-di',
      'topic-spring-mvc',
      'topic-spring-layered',
      'topic-spring-jpa',
    ],
  },
  {
    id: 'doc-ml-revision',
    collectionId: 'col-ml',
    title: 'Machine Learning Revision',
    description: 'Exam cram notes covering linear models, decision tree splitting, ensemble methods, and clustering formulas.',
    type: 'cheatsheet',
    originalFileName: 'CS701_ML_Exam_Prep.pdf',
    fileSize: '3.2 MB',
    isBookmarked: true,
    isTrash: false,
    createdAt: '2026-08-15T11:15:00Z',
    updatedAt: '2026-10-13T16:45:00Z',
    topicIds: [
      'topic-ml-linear-reg',
      'topic-ml-logistic-reg',
      'topic-ml-decision-trees',
      'topic-ml-random-forest',
      'topic-ml-kmeans',
    ],
  },
  {
    id: 'doc-react-notes',
    collectionId: 'col-web',
    title: 'React Notes',
    description: 'In-depth notes on component lifecycle, hook dependencies, declarative routing, and performance optimization.',
    type: 'notes',
    originalFileName: 'Modern_React_Architecture.pdf',
    fileSize: '2.5 MB',
    isBookmarked: false,
    isTrash: false,
    createdAt: '2026-09-01T08:45:00Z',
    updatedAt: '2026-10-14T08:15:00Z',
    topicIds: [
      'topic-react-props-state',
      'topic-react-use-effect',
      'topic-react-router',
    ],
  },
  {
    id: 'doc-net-fundamentals',
    collectionId: 'col-networks',
    title: 'Network Fundamentals',
    description: 'Core concepts in computer networking, the 7-layer reference model, CRC checksums, and sliding window flow control.',
    type: 'notes',
    originalFileName: 'Tanenbaum_Networks_Summary.pdf',
    fileSize: '5.6 MB',
    isBookmarked: false,
    isTrash: false,
    createdAt: '2026-09-12T10:30:00Z',
    updatedAt: '2026-10-11T12:00:00Z',
    topicIds: [
      'topic-net-osi',
      'topic-net-error-detection',
      'topic-net-stop-and-wait',
    ],
  },
];

export const INITIAL_TOPICS: Topic[] = [
  // ==================== JAVA: SPRING BOOT ====================
  {
    id: 'topic-spring-intro',
    documentId: 'doc-spring-boot',
    collectionId: 'col-java',
    title: 'Introduction to Spring Boot',
    summary: 'Opinionated convention-over-configuration framework that eliminates boilerplate Spring setup with embedded servers and starters.',
    pageReference: 'Lecture 1 (PDF p. 4-11)',
    isBookmarked: false,
    tags: ['Spring Boot', 'Java', 'Backend', 'AutoConfiguration'],
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-10-10T15:20:00Z',
    content: `## What is Spring Boot?

Spring Boot is an extension of the Spring framework that aims to simplify the bootstrapping and development of new Spring applications. Rather than configuring verbose XML or excessive \`@Configuration\` beans, Spring Boot takes an **opinionated view** of the Spring platform and third-party libraries so you can get started with minimum fuss.

### Core Value Propositions

- **Auto-Configuration**: Spring Boot automatically configures beans based on the JAR dependencies present on the classpath.
- **Standalone Applications**: Embeds Tomcat, Jetty, or Undertow directly—no need to deploy WAR files to external servlet containers.
- **Starter Dependencies**: Opinionated POMs / Gradle descriptors (e.g., \`spring-boot-starter-web\`, \`spring-boot-starter-data-jpa\`) that group compatible versions together.
- **Production-Ready Features**: Built-in metrics, health checks, and externalized configuration via Spring Boot Actuator.

\`\`\`java
package com.notenest.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @GetMapping("/api/health")
    public String healthCheck() {
        return "NoteNest Spring Service is operational";
    }
}
\`\`\`

### Anatomy of @SpringBootApplication

The \`@SpringBootApplication\` meta-annotation combines three critical Spring annotations:

| Annotation | Purpose |
| :--- | :--- |
| \`@Configuration\` | Tags the class as a source of bean definitions for the application context. |
| \`@EnableAutoConfiguration\` | Instructs Spring Boot to begin adding beans based on classpath settings. |
| \`@ComponentScan\` | Tells Spring to scan the current package and sub-packages for \`@Component\`, \`@Service\`, etc. |

> [!NOTE]
> Always place your main class annotated with \`@SpringBootApplication\` in a root package above other classes to ensure full component scan coverage.`,
  },
  {
    id: 'topic-spring-di',
    documentId: 'doc-spring-boot',
    collectionId: 'col-java',
    title: 'Dependency Injection',
    summary: 'Inversion of Control (IoC) pattern where the container manages object creation and passes dependencies to consumer classes.',
    pageReference: 'Lecture 2 (PDF p. 14-26)',
    isBookmarked: true,
    tags: ['IoC', 'Dependency Injection', 'Clean Architecture', 'Spring Beans'],
    createdAt: '2026-08-11T11:00:00Z',
    updatedAt: '2026-10-12T14:30:00Z',
    content: `## Inversion of Control & Dependency Injection

**Inversion of Control (IoC)** is an architectural principle where control over object lifecycle and dependencies is transferred from the application code to a framework container. **Dependency Injection (DI)** is the primary mechanism Spring uses to implement IoC.

### The Problem Without DI

Without DI, classes tightly couple themselves to concrete implementations using the \`new\` operator:

\`\`\`java
// Tightly coupled, hard to test or mock
public class NoteService {
    private NoteRepository repository = new SqlNoteRepository();
}
\`\`\`

### Three Types of Dependency Injection in Spring

1. **Constructor Injection (Recommended)**: Dependencies are declared as \`final\` and supplied via the class constructor. Guarantees immutability and ensures instances cannot be created in an invalid state.
2. **Setter Injection**: Useful for optional or mutable dependencies.
3. **Field Injection (\`@Autowired\` on private field)**: Strongly discouraged in modern Spring because it hides dependencies, complicates unit testing without a container, and breaks immutability.

\`\`\`java
@Service
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final AuditLogger auditLogger;

    // Constructor injection - @Autowired is optional when there is a single constructor
    public NoteServiceImpl(NoteRepository noteRepository, AuditLogger auditLogger) {
        this.noteRepository = Objects.requireNonNull(noteRepository, "Repository must not be null");
        this.auditLogger = auditLogger;
    }

    @Override
    public NoteDTO createNote(CreateNoteRequest request) {
        auditLogger.logAction("CREATE_NOTE", request.getTitle());
        Note entity = NoteMapper.toEntity(request);
        return NoteMapper.toDTO(noteRepository.save(entity));
    }
}
\`\`\`

### Bean Scopes Comparison

| Scope | Description | Lifecycle Duration |
| :--- | :--- | :--- |
| **singleton** (default) | Single instance per Spring IoC container | Entire application run |
| **prototype** | New instance created every time requested | Garbage collected after use |
| **request** | Single instance per HTTP request | Single web request lifecycle |
| **session** | Single instance per HTTP Session | User HTTP session |`,
  },
  {
    id: 'topic-spring-mvc',
    documentId: 'doc-spring-boot',
    collectionId: 'col-java',
    title: 'Spring MVC Request Flow',
    summary: 'Detailed trace of an incoming HTTP request from DispatcherServlet through HandlerMapping, Controller, and ViewResolver/HttpMessageConverter.',
    pageReference: 'Lecture 3 (PDF p. 28-39)',
    isBookmarked: false,
    tags: ['Spring MVC', 'DispatcherServlet', 'HTTP', 'REST'],
    createdAt: '2026-08-12T14:00:00Z',
    updatedAt: '2026-10-09T09:10:00Z',
    content: `## Spring MVC Request Processing Pipeline

Spring MVC follows the Front Controller architectural pattern centered on the \`DispatcherServlet\`. Every HTTP client request passes through a well-defined sequence of components.

### Step-by-Step Flow

1. **Client Request**: Browser or API client sends an HTTP request (e.g., \`GET /api/topics/101\`).
2. **DispatcherServlet**: Acts as the central dispatcher receiving the raw servlet request.
3. **HandlerMapping**: Queries configured routing rules to locate the matching controller method.
4. **HandlerAdapter**: Executes the identified controller method and resolves arguments (e.g., \`@PathVariable\`, \`@RequestBody\`).
5. **Controller**: Executes business logic or delegates to the Service layer.
6. **HttpMessageConverter**: In REST applications (\`@RestController\`), Jackson converts the returned Java POJO directly to JSON written to the HTTP response body.

\`\`\`
Client Request
      │
      ▼
DispatcherServlet
      │
      ├──► HandlerMapping (Locates matching @RequestMapping)
      │
      ├──► HandlerAdapter (Executes Controller method)
      │          │
      │          ▼
      │    @RestController
      │          │ (Returns Domain Object)
      │          ▼
      ├──► HttpMessageConverter (Jackson: Object -> JSON)
      │
      ▼
HTTP Response (JSON 200 OK)
\`\`\`

### RestController Example

\`\`\`java
@RestController
@RequestMapping("/api/v1/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionDTO> getCollectionById(@PathVariable String id) {
        return collectionService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
\`\`\``,
  },
  {
    id: 'topic-spring-layered',
    documentId: 'doc-spring-boot',
    collectionId: 'col-java',
    title: 'Layered Architecture',
    summary: 'Separation of concerns across Controller, Service, Repository, and Domain Model layers to ensure testability and high cohesion.',
    pageReference: 'Lecture 4 (PDF p. 41-52)',
    isBookmarked: false,
    tags: ['Architecture', 'Clean Code', 'DTOs', 'Repository'],
    createdAt: '2026-08-13T16:00:00Z',
    updatedAt: '2026-10-08T11:45:00Z',
    content: `## Standard 3-Tier Layered Architecture

Enterprise Spring Boot applications partition responsibilities into distinct tiers. Each layer communicates strictly with the layer directly underneath it.

### The Four Core Layers

1. **Presentation / Web Layer (\`@RestController\` / \`@Controller\`)**:
   - Handles HTTP protocol concerns (headers, status codes, query validation).
   - Unmarshals incoming request DTOs and delegates immediately to the service layer.
   - Never contains business calculation logic or direct database queries.

2. **Service / Business Layer (\`@Service\`)**:
   - Coordinates domain operations and business rules.
   - Manages transaction boundaries (\`@Transactional\`).
   - Maps between internal domain entities and external DTOs.

3. **Data Access Layer (\`@Repository\` / Spring Data JPA)**:
   - Encapsulates database persistence and retrieval.
   - Provides CRUD, custom queries, pagination, and sorting.

4. **Domain / Entity Layer (\`@Entity\`)**:
   - Represents the core business state and relational database schema mappings.

### Layer Responsibility Matrix

| Layer | Input | Output | Primary Annotation |
| :--- | :--- | :--- | :--- |
| **Controller** | HTTP Request / DTO | HTTP Response / DTO | \`@RestController\` |
| **Service** | Command / DTO | Domain Result / DTO | \`@Service\` |
| **Repository** | Criteria / ID | Entity / Page<Entity> | \`@Repository\` |`,
  },
  {
    id: 'topic-spring-jpa',
    documentId: 'doc-spring-boot',
    collectionId: 'col-java',
    title: 'Spring Data JPA',
    summary: 'Repository abstraction reducing boilerplate persistence code with derived query methods, pagination, and Hibernate ORM integration.',
    pageReference: 'Lecture 5 (PDF p. 55-70)',
    isBookmarked: true,
    tags: ['Spring Data', 'JPA', 'Hibernate', 'Database', 'SQL'],
    createdAt: '2026-08-14T18:00:00Z',
    updatedAt: '2026-10-12T13:10:00Z',
    content: `## Spring Data JPA & Hibernate

Spring Data JPA provides a repository abstraction over Java Persistence API (JPA) implementations, most commonly **Hibernate**. It dramatically reduces boilerplate code required to perform database transactions and query execution.

### Defining a Repository Interface

By extending \`JpaRepository<T, ID>\`, you immediately inherit methods such as \`findAll()\`, \`save()\`, \`deleteById()\`, and paginated sorting without writing a single line of SQL:

\`\`\`java
@Repository
public interface TopicRepository extends JpaRepository<TopicEntity, String> {

    // Derived Query Method: Spring parses the method name automatically!
    List<TopicEntity> findByDocumentIdOrderByCreatedAtDesc(String documentId);

    // Custom JPQL query for full-text search
    @Query("SELECT t FROM TopicEntity t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<TopicEntity> searchTopicsByTitle(@Param("query") String query);

    // Optimized projection query
    boolean existsByDocumentIdAndTitle(String documentId, String title);
}
\`\`\`

### Common JPA Pitfalls to Avoid

- **N+1 Query Problem**: When traversing a lazy \`@OneToMany\` association inside a loop. Solve using \`JOIN FETCH\` in JPQL or \`@EntityGraph\`.
- **Open Session in View (OSIV)**: Keep disabled in production (\`spring.jpa.open-in-view=false\`) to prevent database connections from staying open during HTTP response streaming.
- **Accidental EAGER fetching**: Always prefer \`FetchType.LAZY\` on relational mappings to avoid loading the entire database graph.`,
  },

  // ==================== MACHINE LEARNING ====================
  {
    id: 'topic-ml-linear-reg',
    documentId: 'doc-ml-revision',
    collectionId: 'col-ml',
    title: 'Linear Regression',
    summary: 'Foundational parametric supervised regression model modeling the linear relationship between continuous features and target values.',
    pageReference: 'Exam Prep (PDF p. 3-8)',
    isBookmarked: false,
    tags: ['Machine Learning', 'Regression', 'Statistics', 'Gradient Descent'],
    createdAt: '2026-08-15T12:00:00Z',
    updatedAt: '2026-10-11T16:00:00Z',
    content: `## Linear Regression

Linear Regression models a continuous target variable $y$ as a linear combination of input features $x_1, x_2, \\dots, x_n$ plus an error term $\\epsilon$:

$$\\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + \\dots + w_n x_n = \\mathbf{w}^T \\mathbf{x}$$

### Cost Function: Ordinary Least Squares (OLS)

The parameters $\\mathbf{w}$ are estimated by minimizing the Mean Squared Error (MSE):

$$J(\\mathbf{w}) = \\frac{1}{2m} \\sum_{i=1}^{m} \\left( h_\\mathbf{w}(x^{(i)}) - y^{(i)} \\right)^2$$

### Optimization: Gradient Descent

Weight updates occur iteratively in the direction of steepest descent:

$$w_j := w_j - \\alpha \\frac{\\partial J(\\mathbf{w})}{\\partial w_j} = w_j - \\alpha \\frac{1}{m} \\sum_{i=1}^m \\left( h_\\mathbf{w}(x^{(i)}) - y^{(i)} \\right) x_j^{(i)}$$

\`\`\`python
import numpy as np

class LinearRegressionGD:
    def __init__(self, lr=0.01, epochs=1000):
        self.lr = lr
        self.epochs = epochs
        self.weights = None
        self.bias = None

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0.0

        for _ in range(self.epochs):
            y_pred = np.dot(X, self.weights) + self.bias
            # Compute gradients
            dw = (1 / n_samples) * np.dot(X.T, (y_pred - y))
            db = (1 / n_samples) * np.sum(y_pred - y)
            # Update weights
            self.weights -= self.lr * dw
            self.bias -= self.lr * db

    def predict(self, X):
        return np.dot(X, self.weights) + self.bias
\`\`\`

### Key Assumptions
1. **Linearity**: The relationship between $X$ and the mean of $Y$ is linear.
2. **Homoscedasticity**: The variance of residual errors is constant across all levels of the independent variables.
3. **No Multicollinearity**: Features should not be linearly correlated with one another.`,
  },
  {
    id: 'topic-ml-logistic-reg',
    documentId: 'doc-ml-revision',
    collectionId: 'col-ml',
    title: 'Logistic Regression',
    summary: 'Binary classification algorithm using the Sigmoid activation function to map linear combinations of inputs to probabilities [0, 1].',
    pageReference: 'Exam Prep (PDF p. 9-16)',
    isBookmarked: true,
    tags: ['Machine Learning', 'Classification', 'Sigmoid', 'Cross-Entropy'],
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-10-13T16:45:00Z',
    content: `## Logistic Regression

Despite its name, Logistic Regression is a **classification** algorithm used to estimate the probability that a given instance belongs to a discrete category (typically binary: 0 or 1).

### The Sigmoid Function

To constrain linear predictions into a valid probability range between $0$ and $1$, the logit is passed through the standard logistic (sigmoid) function:

$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$

Where $z = \\mathbf{w}^T \\mathbf{x} + b$.

### Binary Cross-Entropy (Log Loss)

Because MSE produces a non-convex optimization surface with sigmoid activations, we use Cross-Entropy loss:

$$J(\\mathbf{w}) = -\\frac{1}{m} \\sum_{i=1}^m \\left[ y^{(i)} \\log(\\hat{y}^{(i)}) + (1 - y^{(i)}) \\log(1 - \\hat{y}^{(i)}) \\right]$$

\`\`\`python
import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def binary_cross_entropy(y_true, y_pred, eps=1e-15):
    y_pred = np.clip(y_pred, eps, 1 - eps)
    return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
\`\`\`

### Decision Threshold
By default, instances with $P(Y=1 | X) \\ge 0.5$ are classified as Class 1. For imbalanced datasets (e.g., fraud detection), the threshold can be tuned to optimize **Recall** vs **Precision**.`,
  },
  {
    id: 'topic-ml-decision-trees',
    documentId: 'doc-ml-revision',
    collectionId: 'col-ml',
    title: 'Decision Trees',
    summary: 'Non-parametric supervised model partitioning feature space using Gini Impurity or Information Gain splits.',
    pageReference: 'Exam Prep (PDF p. 18-25)',
    isBookmarked: false,
    tags: ['Decision Trees', 'Entropy', 'Gini', 'Non-parametric'],
    createdAt: '2026-08-17T14:30:00Z',
    updatedAt: '2026-10-10T12:00:00Z',
    content: `## Decision Trees

A Decision Tree is a non-parametric model that breaks down a complex dataset into smaller, increasingly homogeneous subsets using recursive binary splits.

### Splitting Criteria

#### 1. Gini Impurity (CART algorithm)
Measures the probability of misclassifying a randomly chosen element from the set:

$$I_G(p) = 1 - \\sum_{k=1}^K p_k^2$$

#### 2. Information Gain / Shannon Entropy (ID3 / C4.5)
Measures the amount of information or surprise in a distribution:

$$H(S) = -\\sum_{k=1}^K p_k \\log_2(p_k)$$

### Tree Pruning & Regularization
Unconstrained trees will continue splitting until every leaf is pure, leading to severe **overfitting** (high variance). Key hyperparameter constraints:
- \`max_depth\`: Limits how deep the tree can grow.
- \`min_samples_split\`: Minimum samples required to split an internal node.
- \`min_samples_leaf\`: Minimum samples required at any terminal leaf.`,
  },
  {
    id: 'topic-ml-random-forest',
    documentId: 'doc-ml-revision',
    collectionId: 'col-ml',
    title: 'Random Forest',
    summary: 'Bagging ensemble technique that averages predictions across hundreds of de-correlated decision trees with bootstrap aggregation.',
    pageReference: 'Exam Prep (PDF p. 27-35)',
    isBookmarked: false,
    tags: ['Ensemble', 'Random Forest', 'Bagging', 'Variance Reduction'],
    createdAt: '2026-08-18T09:15:00Z',
    updatedAt: '2026-10-09T18:20:00Z',
    content: `## Random Forest Ensemble

Random Forest is a bagging (Bootstrap Aggregation) ensemble method that builds a collection of decision trees and aggregates their outputs (majority voting for classification, mean prediction for regression).

### Key Mechanisms

1. **Bootstrap Sampling**: Each tree in the forest is trained on an independent random sample of size $N$ drawn *with replacement* from the original dataset (~63.2% unique rows per tree).
2. **Random Feature Subsets**: At each split, only a random subset of features $\\sqrt{p}$ is considered. This **de-correlates** the individual trees, drastically reducing the overall ensemble variance.

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Initialize forest with 200 estimators
clf = RandomForestClassifier(
    n_estimators=200,
    max_features='sqrt',
    max_depth=12,
    random_state=42
)

clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred))
\`\`\`

### Out-Of-Bag (OOB) Evaluation
The ~36.8% of training samples left out of each bootstrap tree constitute the Out-Of-Bag set, enabling validation score estimation without requiring a separate cross-validation split.`,
  },
  {
    id: 'topic-ml-kmeans',
    documentId: 'doc-ml-revision',
    collectionId: 'col-ml',
    title: 'K-Means Clustering',
    summary: 'Unsupervised partitioning algorithm that iteratively assigns data points to the nearest centroid and recomputes centroid locations.',
    pageReference: 'Exam Prep (PDF p. 38-46)',
    isBookmarked: false,
    tags: ['Unsupervised', 'Clustering', 'K-Means', 'Elbow Method'],
    createdAt: '2026-08-19T11:45:00Z',
    updatedAt: '2026-10-07T14:10:00Z',
    content: `## K-Means Clustering

K-Means is an unsupervised clustering algorithm that partitions $n$ observations into $K$ distinct, non-overlapping clusters based on geometric distance.

### The Algorithm

1. **Initialization**: Choose $K$ initial cluster centroids $\\mu_1, \\mu_2, \\dots, \\mu_K$ (typically using K-Means++ to maximize distance between initial centers).
2. **Assignment Step**: Assign each observation $x^{(i)}$ to its closest centroid:
   $$c^{(i)} = \\arg\\min_j \\|x^{(i)} - \\mu_j\\|^2$$
3. **Update Step**: Recompute each centroid $\\mu_j$ as the arithmetic mean of all data points assigned to cluster $j$:
   $$\\mu_j = \\frac{1}{|S_j|} \\sum_{i \\in S_j} x^{(i)}$$
4. **Convergence**: Repeat steps 2 and 3 until centroids cease shifting or maximum iterations are reached.

### Determining Optimal K: The Elbow Method
Plot the Within-Cluster Sum of Squares (WCSS / Inertia) against candidate values of $K$. The point where the rate of decrease abruptly slows down represents the "elbow":

\`\`\`
Inertia (WCSS)
  ▲
  │  ●
  │   \\
  │    ●
  │     \\
  │      ●  <-- Optimal K ("The Elbow")
  │       \\___________●______●
  └──────────────────────────────► K (Number of clusters)
\`\`\``,
  },

  // ==================== WEB DEVELOPMENT ====================
  {
    id: 'topic-react-props-state',
    documentId: 'doc-react-notes',
    collectionId: 'col-web',
    title: 'Props and State',
    summary: 'Core data flow primitives in React: immutable external inputs passed via props vs mutable internal reactive state via useState.',
    pageReference: 'Architecture Guide (PDF p. 12-20)',
    isBookmarked: false,
    tags: ['React', 'Props', 'State', 'Frontend', 'Components'],
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-10-14T08:15:00Z',
    content: `## Props vs State in Modern React

In React, component re-renders are driven primarily by changes to **Props** or **State**. Understanding the boundary between immutable inputs and reactive state is fundamental.

### Comparison Table

| Attribute | Props (Properties) | State |
| :--- | :--- | :--- |
| **Origin** | Passed down from parent component | Managed internally within the component |
| **Mutability** | Read-only (immutable to receiver) | Mutable via setter function (\`setState\`) |
| **Re-render trigger** | Changes when parent re-renders with new props | Triggered when setter receives new reference |
| **Scope** | External interface of the component | Private encapsulated memory |

### Practical Example

\`\`\`tsx
interface TopicCardProps {
  title: string;
  topicCount: number;
  onOpen: () => void;
}

export function TopicCard({ title, topicCount, onOpen }: TopicCardProps) {
  // Local reactive state
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-100">{title}</h3>
        <button
          onClick={() => setIsBookmarked(prev => !prev)}
          className={isBookmarked ? "text-amber-400" : "text-slate-500"}
        >
          ★
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-1">{topicCount} topics indexed</p>
      <button onClick={onOpen} className="mt-3 text-sm text-emerald-400 hover:underline">
        Read Document →
      </button>
    </div>
  );
}
\`\`\`

> [!IMPORTANT]
> Never mutate state variables directly (e.g. \`items.push(x)\`). Always return a brand new array or object reference (e.g. \`setItems(prev => [...prev, x])\`) so React can detect the change during shallow comparison.`,
  },
  {
    id: 'topic-react-use-effect',
    documentId: 'doc-react-notes',
    collectionId: 'col-web',
    title: 'useEffect',
    summary: 'Hook for managing side effects, network subscriptions, timers, and DOM synchronization with cleanup functions and dependency arrays.',
    pageReference: 'Architecture Guide (PDF p. 24-33)',
    isBookmarked: true,
    tags: ['React', 'Hooks', 'useEffect', 'Lifecycle', 'SideEffects'],
    createdAt: '2026-09-02T10:30:00Z',
    updatedAt: '2026-10-13T17:00:00Z',
    content: `## The useEffect Hook

\`useEffect\` lets you synchronize a component with external systems (such as browsers APIs, networks, or WebSocket connections).

### Dependency Array Patterns

\`\`\`tsx
// 1. No dependency array: Executes after EVERY render cycle
useEffect(() => {
  console.log("Component re-rendered");
});

// 2. Empty dependency array: Executes ONCE upon initial mount
useEffect(() => {
  console.log("Component mounted");
  return () => console.log("Component unmounted");
}, []);

// 3. Specified dependencies: Executes when referenced variables change
useEffect(() => {
  fetchTopicData(selectedTopicId);
}, [selectedTopicId]);
\`\`\`

### Cleanup Functions and Subscriptions

When an effect performs asynchronous subscriptions or event listeners, return a cleanup function to prevent memory leaks and race conditions:

\`\`\`tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(prev => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
\`\`\`

### Common useEffect Anti-Patterns
- **Transforming data for rendering**: Do not use \`useEffect\` to update state when one variable depends on another. Calculate it inline during render or with \`useMemo\`.
- **Handling user events**: Logic triggered by a button click belongs in the \`onClick\` handler, not in an effect.`,
  },
  {
    id: 'topic-react-router',
    documentId: 'doc-react-notes',
    collectionId: 'col-web',
    title: 'React Router',
    summary: 'Declarative routing library enabling deep link state, nested layouts, loader data fetching, and programmatic navigation.',
    pageReference: 'Architecture Guide (PDF p. 38-48)',
    isBookmarked: false,
    tags: ['React Router', 'SPA', 'Routing', 'URL State'],
    createdAt: '2026-09-03T14:15:00Z',
    updatedAt: '2026-10-09T16:30:00Z',
    content: `## Declarative Routing in Single-Page Applications

Client-side routing allows a web application to update the URL and render new UI views without requesting a full page reload from the web server.

### Core Concepts

- **Routes & Outlets**: Parent layout routes render an \`<Outlet />\` component where matched nested child route components are dynamically injected.
- **Dynamic Segments**: Parameters in the URL (e.g. \`/collections/:collectionId/documents/:docId\`) accessible via \`useParams()\`.
- **Search Parameters**: Query strings (e.g. \`?q=react&view=grid\`) synchronized using \`useSearchParams()\`.

\`\`\`tsx
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<LibraryDashboard />} />
        <Route path="collections/:collectionId" element={<CollectionExplorer />} />
        <Route path="topics/:topicId" element={<TopicReader />} />
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
}

function TopicReader() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>Viewing Topic ID: {topicId}</h2>
    </div>
  );
}
\`\`\`

> [!NOTE]
> In Next.js App Router (used in NoteNest), folder hierarchy under \`app/\` maps directly to routes, with \`page.tsx\` acting as the leaf and \`layout.tsx\` preserving shared client state without re-rendering overhead.`,
  },

  // ==================== COMPUTER NETWORKS ====================
  {
    id: 'topic-net-osi',
    documentId: 'doc-net-fundamentals',
    collectionId: 'col-networks',
    title: 'OSI Model',
    summary: 'The 7-layer Open Systems Interconnection conceptual model defining standard protocols and encapsulation across telecommunication networks.',
    pageReference: 'Chapter 1 (PDF p. 12-28)',
    isBookmarked: false,
    tags: ['Networking', 'OSI Model', 'Protocols', 'TCP/IP', 'Packets'],
    createdAt: '2026-09-12T11:00:00Z',
    updatedAt: '2026-10-11T12:00:00Z',
    content: `## The 7-Layer OSI Reference Model

The Open Systems Interconnection (OSI) reference model is an ISO standard conceptual framework that partitions telecommunication network operations into seven distinct hierarchical layers.

### The 7 Layers Breakdown

| Layer # | Name | Data Unit (PDU) | Primary Function & Protocols |
| :---: | :--- | :--- | :--- |
| **7** | **Application** | Data | Network services for user applications (HTTP, DNS, SSH, SMTP) |
| **6** | **Presentation** | Data | Data formatting, encryption, compression (TLS, JPEG, ASCII) |
| **5** | **Session** | Data | Session establishment, checkpointing, termination (RPC, NetBIOS) |
| **4** | **Transport** | Segment / Datagram | End-to-end reliability, port multiplexing (TCP, UDP) |
| **3** | **Network** | Packet | Logical addressing, packet routing across subnets (IP, ICMP, BGP) |
| **2** | **Data Link** | Frame | Physical MAC addressing, error detection, framing (Ethernet, Wi-Fi) |
| **1** | **Physical** | Bits | Transmission of raw unstructured bit streams over physical media |

### Encapsulation and De-encapsulation

As application data travels down the stack, each layer attaches its own protocol header (and trailer at Layer 2):

\`\`\`
[Data]                               Application (HTTP)
[TCP Header | Data]                   Transport (Segment)
[IP Header | TCP Header | Data]       Network (Packet)
[Ethernet Header | IP Header | TCP Header | Data | CRC] Data Link (Frame)
010100101010010101010100110001001010 Physical (Bits on Wire)
\`\`\`

> [!TIP]
> Memory mnemonic for OSI layers (Layer 7 down to Layer 1):
> **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing`,
  },
  {
    id: 'topic-net-error-detection',
    documentId: 'doc-net-fundamentals',
    collectionId: 'col-networks',
    title: 'Error Detection',
    summary: 'Techniques including parity checks, 16-bit internet checksums, and Cyclic Redundancy Checks (CRC) for verifying bit integrity in noisy transmission channels.',
    pageReference: 'Chapter 3 (PDF p. 32-44)',
    isBookmarked: true,
    tags: ['Error Detection', 'CRC', 'Checksum', 'Data Link', 'Polynomials'],
    createdAt: '2026-09-13T13:30:00Z',
    updatedAt: '2026-10-10T14:50:00Z',
    content: `## Error Detection in Communication Channels

Physical transmission mediums introduce noise, signal attenuation, and electromagnetic interference that can flip bits ($0 \\to 1$ or $1 \\to 0$). Error detection schemes append redundant check bits to the payload so the receiver can detect corrupted frames.

### Three Primary Methods

#### 1. Parity Check
- **Single Parity**: Adds 1 extra bit so total count of 1s is even (even parity) or odd (odd parity). Detects all odd-numbered bit flips, but fails completely on 2-bit flips.
- **Two-Dimensional Parity**: Arranges bits in a matrix and calculates parity along rows and columns, allowing single-bit error correction.

#### 2. Internet Checksum (Used in IP, TCP, UDP)
1. Split data stream into 16-bit words.
2. Sum words using ones' complement arithmetic.
3. Take the ones' complement of the final sum.
4. Receiver repeats calculation; if sum equals all 1s (\`0xFFFF\`), the packet is assumed intact.

#### 3. Cyclic Redundancy Check (CRC)
CRC treats bit strings as algebraic polynomials with binary coefficients modulo 2:

$$\\text{Message Polynomial } M(x) \\cdot x^r = Q(x) \\cdot G(x) + R(x)$$

Where $G(x)$ is a standardized generator polynomial (e.g. CRC-32 used in Ethernet frames). The remainder $R(x)$ becomes the Frame Check Sequence (FCS) appended to the message.

\`\`\`
Sender:
Message: 110100  |  Generator: 1011 (Degree 3)
Append 3 zeros: 110100000
Perform Modulo-2 binary division (XOR)
Remainder: 011  ==> Transmitted Frame: 110100011

Receiver:
Divides received 110100011 by generator 1011
If remainder == 0: Frame is valid!
If remainder != 0: Frame corrupted -> Discard!
\`\`\``,
  },
  {
    id: 'topic-net-stop-and-wait',
    documentId: 'doc-net-fundamentals',
    collectionId: 'col-networks',
    title: 'Stop-and-Wait ARQ',
    summary: 'Automatic Repeat reQuest flow control protocol ensuring reliable data transfer over unreliable channels using ACKs, timeouts, and 1-bit sequence numbers.',
    pageReference: 'Chapter 3 (PDF p. 48-59)',
    isBookmarked: false,
    tags: ['Flow Control', 'ARQ', 'Protocols', 'Stop-and-Wait', 'Reliability'],
    createdAt: '2026-09-14T15:00:00Z',
    updatedAt: '2026-10-08T09:30:00Z',
    content: `## Stop-and-Wait Automatic Repeat reQuest (ARQ)

Stop-and-Wait ARQ is the simplest protocol for achieving reliable, in-order, error-free communication over an unreliable transmission link.

### Operating Rules

1. **Sender transmits Frame 0** and starts a countdown retransmission timer.
2. **Sender waits** and transmits no further data until an Acknowledgement (\`ACK 1\`) is received.
3. **If receiver gets an undamaged frame**, it sends \`ACK 1\` (requesting next frame).
4. **If frame or ACK is lost/corrupted**, the sender's timer expires (**timeout**), prompting retransmission of Frame 0.
5. **Alternating 1-bit sequence numbers (0 and 1)** prevent the receiver from delivering duplicate packets if an ACK was merely delayed.

\`\`\`
SENDER                                RECEIVER
  │                                      │
  │────── Frame 0 (Seq=0) ──────────────►│
  │                                      │ (Delivers to network layer)
  │◄───── ACK 1 ─────────────────────────│
  │                                      │
  │────── Frame 1 (Seq=1) ──────X        │ (Frame lost in transit)
  │  (Timer expires: Timeout!)           │
  │                                      │
  │────── Frame 1 (Retransmit) ─────────►│
  │                                      │
  │◄───── ACK 0 ─────────────────────────│
\`\`\`

### Protocol Efficiency Formula

Because Stop-and-Wait keeps the link idle while waiting for round-trip propagation, its utilization $\\eta$ is severely constrained over high bandwidth-delay product links:

$$\\eta = \\frac{T_\\text{transmission}}{T_\\text{transmission} + 2 \\cdot T_\\text{propagation}} = \\frac{1}{1 + 2a}$$

Where $a = \\frac{T_\\text{prop}}{T_\\text{trans}}$. This limitation motivated the development of sliding-window protocols like **Go-Back-N** and **Selective Repeat** in TCP.`,
  },
];
